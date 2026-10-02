import { Router, Request, Response } from 'express';

export const geoRouter = Router();

// High-speed Places & Geocoding Autocomplete Endpoint
geoRouter.get('/autocomplete', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query) {
      return res.json({ success: true, suggestions: [] });
    }

    const googlePlacesKey =
      process.env.GOOGLE_PLACES_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.VITE_GOOGLE_MAPS_API_KEY ||
      '';

    // 1. Google Places API Autocomplete (if key configured)
    if (googlePlacesKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&types=(cities)&key=${googlePlacesKey}`;
        const gRes = await fetch(googleUrl);
        const gData: any = await gRes.json();

        if (gData.status === 'OK' && Array.isArray(gData.predictions)) {
          const topPredictions = gData.predictions.slice(0, 6);
          const detailedSuggestions = await Promise.all(
            topPredictions.map(async (p: any) => {
              try {
                const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${p.place_id}&fields=geometry,address_component,formatted_address&key=${googlePlacesKey}`;
                const dRes = await fetch(detailUrl);
                const dData: any = await dRes.json();
                const loc = dData.result?.geometry?.location;

                let timezone = 'Asia/Kolkata';
                const desc = p.description.toLowerCase();
                if (desc.includes('united states') || desc.includes('usa')) {
                  timezone = 'America/New_York';
                } else if (desc.includes('united kingdom') || desc.includes('uk')) {
                  timezone = 'Europe/London';
                } else if (desc.includes('united arab emirates') || desc.includes('dubai')) {
                  timezone = 'Asia/Dubai';
                } else if (desc.includes('australia')) {
                  timezone = 'Australia/Sydney';
                } else if (desc.includes('singapore')) {
                  timezone = 'Asia/Singapore';
                }

                return {
                  id: p.place_id,
                  description: p.description,
                  cityName: p.structured_formatting?.main_text || p.description.split(',')[0],
                  latitude: loc?.lat || 20.5937,
                  longitude: loc?.lng || 78.9629,
                  timezone,
                };
              } catch {
                return null;
              }
            })
          );

          const valid = detailedSuggestions.filter(Boolean);
          if (valid.length > 0) {
            return res.json({ success: true, source: 'google_places_api', suggestions: valid });
          }
        }
      } catch (err: any) {
        console.warn('[GOOGLE PLACES FALLBACK]:', err.message);
      }
    }

    // 2. High-Speed Global Photon Geocoder Fallback
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8`;
    const photonRes = await fetch(photonUrl);
    if (photonRes.ok) {
      const photonData: any = await photonRes.json();
      if (photonData.features && Array.isArray(photonData.features)) {
        const suggestions = photonData.features
          .filter((f: any) => f.properties?.name)
          .map((f: any, idx: number) => {
            const p = f.properties;
            const parts = [p.name, p.state, p.country].filter(Boolean);
            const country = (p.country || '').toLowerCase();

            let timezone = 'Asia/Kolkata';
            if (country.includes('united states') || country.includes('usa')) timezone = 'America/New_York';
            else if (country.includes('united kingdom') || country.includes('uk')) timezone = 'Europe/London';
            else if (country.includes('united arab emirates')) timezone = 'Asia/Dubai';
            else if (country.includes('australia')) timezone = 'Australia/Sydney';
            else if (country.includes('japan')) timezone = 'Asia/Tokyo';
            else if (country.includes('germany') || country.includes('france')) timezone = 'Europe/Paris';

            return {
              id: `geo_${idx}_${p.osm_id || Math.random()}`,
              description: parts.join(', '),
              cityName: p.name,
              state: p.state,
              country: p.country,
              latitude: Number(f.geometry.coordinates[1].toFixed(4)),
              longitude: Number(f.geometry.coordinates[0].toFixed(4)),
              timezone,
            };
          });

        return res.json({ success: true, source: 'photon_geocoder', suggestions });
      }
    }

    res.json({ success: true, suggestions: [] });
  } catch (error: any) {
    console.error('Geo autocomplete error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
