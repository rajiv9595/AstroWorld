/**
 * ASTROWORLD — City & Location Geocoding Service
 * High-speed city search with Google Places API integration & instant fallback.
 */

export interface PlaceSuggestion {
  id: string;
  description: string;
  cityName: string;
  state?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

// Pre-indexed high-speed Indian & Global cities for sub-millisecond 1-letter typing response
export const TOP_CITIES_INDEX: PlaceSuggestion[] = [
  // Andhra Pradesh & Telangana
  { id: 'ap_1', description: 'Hyderabad, Telangana, India', cityName: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { id: 'ap_2', description: 'Visakhapatnam, Andhra Pradesh, India', cityName: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, timezone: 'Asia/Kolkata' },
  { id: 'ap_3', description: 'Vijayawada, Andhra Pradesh, India', cityName: 'Vijayawada', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, timezone: 'Asia/Kolkata' },
  { id: 'ap_4', description: 'Rajahmundry, Andhra Pradesh, India', cityName: 'Rajahmundry', state: 'Andhra Pradesh', country: 'India', latitude: 17.0005, longitude: 81.8040, timezone: 'Asia/Kolkata' },
  { id: 'ap_5', description: 'Kakinada, Andhra Pradesh, India', cityName: 'Kakinada', state: 'Andhra Pradesh', country: 'India', latitude: 16.9891, longitude: 82.2475, timezone: 'Asia/Kolkata' },
  { id: 'ap_6', description: 'Tirupati, Andhra Pradesh, India', cityName: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, timezone: 'Asia/Kolkata' },
  { id: 'ap_7', description: 'Guntur, Andhra Pradesh, India', cityName: 'Guntur', state: 'Andhra Pradesh', country: 'India', latitude: 16.3067, longitude: 80.4365, timezone: 'Asia/Kolkata' },
  { id: 'ap_8', description: 'Warangal, Telangana, India', cityName: 'Warangal', state: 'Telangana', country: 'India', latitude: 17.9689, longitude: 79.5941, timezone: 'Asia/Kolkata' },

  // Metros & Major Indian Hubs
  { id: 'in_1', description: 'New Delhi, Delhi, India', cityName: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezone: 'Asia/Kolkata' },
  { id: 'in_2', description: 'Mumbai, Maharashtra, India', cityName: 'Mumbai', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { id: 'in_3', description: 'Bengaluru, Karnataka, India', cityName: 'Bengaluru', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { id: 'in_4', description: 'Chennai, Tamil Nadu, India', cityName: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { id: 'in_5', description: 'Kolkata, West Bengal, India', cityName: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { id: 'in_6', description: 'Ahmedabad, Gujarat, India', cityName: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { id: 'in_7', description: 'Pune, Maharashtra, India', cityName: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' },
  { id: 'in_8', description: 'Jaipur, Rajasthan, India', cityName: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' },
  { id: 'in_9', description: 'Lucknow, Uttar Pradesh, India', cityName: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
  { id: 'in_10', description: 'Varanasi, Uttar Pradesh, India', cityName: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata' },
  { id: 'in_11', description: 'Chandigarh, Punjab, India', cityName: 'Chandigarh', state: 'Punjab', country: 'India', latitude: 30.7333, longitude: 76.7794, timezone: 'Asia/Kolkata' },
  { id: 'in_12', description: 'Bhopal, Madhya Pradesh, India', cityName: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, timezone: 'Asia/Kolkata' },
  { id: 'in_13', description: 'Indore, Madhya Pradesh, India', cityName: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezone: 'Asia/Kolkata' },
  { id: 'in_14', description: 'Patna, Bihar, India', cityName: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata' },
  { id: 'in_15', description: 'Kochi, Kerala, India', cityName: 'Kochi', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezone: 'Asia/Kolkata' },
  { id: 'in_16', description: 'Thiruvananthapuram, Kerala, India', cityName: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, timezone: 'Asia/Kolkata' },
  { id: 'in_17', description: 'Nagpur, Maharashtra, India', cityName: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezone: 'Asia/Kolkata' },
  { id: 'in_18', description: 'Surat, Gujarat, India', cityName: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezone: 'Asia/Kolkata' },
  { id: 'in_19', description: 'Coimbatore, Tamil Nadu, India', cityName: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, timezone: 'Asia/Kolkata' },
  { id: 'in_20', description: 'Bhubaneswar, Odisha, India', cityName: 'Bhubaneswar', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, timezone: 'Asia/Kolkata' },
  { id: 'in_21', description: 'Guwahati, Assam, India', cityName: 'Guwahati', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezone: 'Asia/Kolkata' },

  // Global Hubs
  { id: 'gl_1', description: 'London, United Kingdom', cityName: 'London', state: 'England', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { id: 'gl_2', description: 'New York, NY, United States', cityName: 'New York', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezone: 'America/New_York' },
  { id: 'gl_3', description: 'Dubai, United Arab Emirates', cityName: 'Dubai', state: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { id: 'gl_4', description: 'Singapore, Singapore', cityName: 'Singapore', state: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { id: 'gl_5', description: 'Toronto, Ontario, Canada', cityName: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { id: 'gl_6', description: 'Sydney, NSW, Australia', cityName: 'Sydney', state: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { id: 'gl_7', description: 'San Francisco, CA, United States', cityName: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { id: 'gl_8', description: 'Tokyo, Japan', cityName: 'Tokyo', state: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
];

/**
 * Search cities with sub-second response:
 * 1. Queries local index immediately for prefix matches (instant 1-letter response)
 * 2. Fetches from backend /api/geo/autocomplete (which proxies Google Places API if configured)
 */
export async function searchCities(query: string): Promise<PlaceSuggestion[]> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return [];

  // Instant local match (sub-millisecond)
  const localMatches = TOP_CITIES_INDEX.filter(
    (c) =>
      c.cityName.toLowerCase().startsWith(cleanQ) ||
      c.description.toLowerCase().includes(cleanQ)
  );

  try {
    const res = await fetch(`/api/geo/autocomplete?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        // Merge and deduplicate by description
        const combined = [...data.suggestions];
        for (const loc of localMatches) {
          if (!combined.some((c) => c.description.toLowerCase() === loc.description.toLowerCase())) {
            combined.push(loc);
          }
        }
        return combined.slice(0, 8);
      }
    }
  } catch (err) {
    console.warn('Backend geo search failed, using local index:', err);
  }

  return localMatches.slice(0, 8);
}
