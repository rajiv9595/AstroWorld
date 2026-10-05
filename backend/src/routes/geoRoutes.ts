import { Router, Request, Response } from 'express';

export const geoRouter = Router();

interface ResolvedLocation {
  id: string;
  description: string;
  cityName: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

function isValidCoordinatePair(latitude: unknown, longitude: unknown): boolean {
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  );
}

async function resolveGoogleTimezone(
  latitude: number,
  longitude: number,
  timestampSeconds = Math.floor(Date.now() / 1000),
): Promise<string | undefined> {
  const key =
    process.env.GOOGLE_TIMEZONE_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    '';

  if (!key || !isValidCoordinatePair(latitude, longitude)) return undefined;

  try {
    const url =
      'https://maps.googleapis.com/maps/api/timezone/json?location=' +
      encodeURIComponent(latitude + ',' + longitude) +
      '&timestamp=' +
      timestampSeconds +
      '&key=' +
      encodeURIComponent(key);

    const response = await fetch(url);
    if (!response.ok) return undefined;

    const data = await response.json();
    if (data.status === 'OK' && typeof data.timeZoneId === 'string' && data.timeZoneId.trim()) {
      return data.timeZoneId.trim();
    }
  } catch (error) {
    console.warn('[Google Time Zone] lookup failed:', error);
  }

  return undefined;
}


/**
 * Resolve an IANA timezone for one selected coordinate.
 * This endpoint is intentionally separate from autocomplete so a typing
 * session does not trigger a fan-out of timezone requests.
 */
geoRouter.get('/timezone', async (req: Request, res: Response) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (!isValidCoordinatePair(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Valid latitude and longitude are required.',
      });
    }

    const timezone = await resolveGoogleTimezone(latitude, longitude);
    if (!timezone) {
      return res.status(404).json({
        success: false,
        error: 'Timezone could not be resolved for these coordinates.',
      });
    }

    return res.json({
      success: true,
      timezone,
      source: 'google_time_zone_api',
    });
  } catch (error) {
    console.error('Geo timezone error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to resolve timezone right now.',
    });
  }
});

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

    if (googlePlacesKey) {
      try {
        const googleUrl =
          'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' +
          encodeURIComponent(query) +
          '&types=(cities)&key=' +
          encodeURIComponent(googlePlacesKey);

        const gRes = await fetch(googleUrl);
        const gData = await gRes.json();

        if (gData.status === 'OK' && Array.isArray(gData.predictions)) {
          const topPredictions = gData.predictions.slice(0, 6);

          const detailedSuggestions = await Promise.all(
            topPredictions.map(async (p: any): Promise<ResolvedLocation | null> => {
              try {
                const detailUrl =
                  'https://maps.googleapis.com/maps/api/place/details/json?place_id=' +
                  encodeURIComponent(p.place_id) +
                  '&fields=geometry,address_component,formatted_address&key=' +
                  encodeURIComponent(googlePlacesKey);

                const dRes = await fetch(detailUrl);
                const dData = await dRes.json();
                const loc = dData.result?.geometry?.location;

                const latitude = Number(loc?.lat);
                const longitude = Number(loc?.lng);

                if (!isValidCoordinatePair(latitude, longitude)) return null;

                return {
                  id: p.place_id,
                  description: p.description,
                  cityName: p.structured_formatting?.main_text || p.description.split(',')[0],
                  latitude,
                  longitude,
                };
              } catch {
                return null;
              }
            }),
          );

          const valid = detailedSuggestions.filter(Boolean);
          if (valid.length > 0) {
            return res.json({ success: true, source: 'google_places_api', suggestions: valid });
          }
        }
      } catch (error) {
        console.warn('[Google Places] lookup failed:', error);
      }
    }

    const photonUrl =
      'https://photon.komoot.io/api/?q=' +
      encodeURIComponent(query) +
      '&limit=8';

    const photonRes = await fetch(photonUrl);
    if (photonRes.ok) {
      const photonData = await photonRes.json();

      if (Array.isArray(photonData.features)) {
        const suggestions = (
          await Promise.all(
            photonData.features
              .filter((f: any) => f.properties?.name)
              .map(async (f: any, idx: number): Promise<ResolvedLocation | null> => {
                const latitude = Number(f.geometry?.coordinates?.[1]);
                const longitude = Number(f.geometry?.coordinates?.[0]);

                if (!isValidCoordinatePair(latitude, longitude)) return null;

                const p = f.properties;
                const parts = [p.name, p.state, p.country].filter(Boolean);
                return {
                  id: 'geo_' + idx + '_' + String(p.osm_id || Math.floor(latitude * 10000) + '_' + Math.floor(longitude * 10000)),
                  description: parts.join(', '),
                  cityName: p.name,
                  state: p.state,
                  country: p.country,
                  latitude: Number(latitude.toFixed(6)),
                  longitude: Number(longitude.toFixed(6)),
                };
              }),
          )
        ).filter(Boolean);

        return res.json({ success: true, source: 'photon_geocoder', suggestions });
      }
    }

    return res.json({ success: true, suggestions: [] });
  } catch (error) {
    console.error('Geo autocomplete error:', error);
    return res.status(500).json({ success: false, error: 'Unable to resolve location right now.' });
  }
});
