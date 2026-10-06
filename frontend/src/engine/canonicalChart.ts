/**
 * AstroWorld frontend compatibility adapter.
 * Calculation truth lives in @astroworld/shared.
 */

export * from '@astroworld/shared';

import type { BirthProfile } from '@astroworld/shared';

export function detectRegionalChartStyle(profile: BirthProfile): 'NORTH_INDIAN' | 'SOUTH_INDIAN' {
  const city = (profile.cityName || '').toLowerCase();
  const lat = Number(profile.latitude);
  const lon = Number(profile.longitude);

  const southKeywords = [
    'andhra', 'telangana', 'tamil', 'karnataka', 'kerala', 'puducherry', 'pondicherry',
    'hyderabad', 'secunderabad', 'chennai', 'madras', 'bengaluru', 'bangalore', 'visakhapatnam', 'vizag',
    'vijayawada', 'anaparthy', 'anaparthi', 'rajahmundry', 'rajamahendravaram', 'guntur', 'tirupati',
    'coimbatore', 'madurai', 'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram', 'mysore', 'mysuru',
    'mangalore', 'mangaluru', 'calicut', 'kozhikode', 'amaravati', 'kakinada', 'warangal', 'nellore',
    'salem', 'trichy', 'tiruchirappalli', 'thrissur', 'kollam', 'palakkad', 'hubli', 'belgaum', 'belagavi',
    'kottayam', 'alappuzha', 'alleppey', 'bellary', 'ballari', 'davanagere', 'shivamogga', 'shimoga',
    'kurnool', 'kadapa', 'anantapur', 'chittoor', 'eluru', 'ongole', 'machilipatnam', 'srikakulam',
    'vizianagaram', 'nizamabad', 'khammam', 'karimnagar', 'ramagundam', 'mahabubnagar', 'nalgonda',
    'suryapet', 'mancherial', 'adoni', 'nandyal', 'proddatur', 'hindupur', 'bhimavaram', 'madanapalle',
    'tadepalligudem', 'dharmavaram', 'guntakal', 'srikalahasti', 'tenali', 'narasaraopet', 'chilakaluripet',
    'vellore', 'erode', 'tiruppur', 'thoothukudi', 'tuticorin', 'dindigul', 'thanjavur', 'ranipet',
    'sivakasi', 'karur', 'ooty', 'udhagamandalam', 'hosur', 'nagercoil', 'kanchipuram', 'kumarakom',
    'kannur', 'kasaragod', 'malappuram', 'wayanad', 'idukki', 'pathanamthitta', 'gulbarga', 'kalaburagi',
    'bijapur', 'vijayapura', 'udupi', 'hassan', 'bidar', 'raichur', 'gadag', 'bagalkot', 'tumkur',
    'tumakuru', 'kolar', 'mandya', 'chikmagalur', 'sri lanka', 'colombo', 'jaffna', 'kandy'
  ];

  if (southKeywords.some((kw) => city.includes(kw))) {
    return 'SOUTH_INDIAN';
  }

  if (!Number.isNaN(lat) && lat > 6.0 && lat <= 20.2) {
    if (Number.isNaN(lon) || (lon >= 68.0 && lon <= 92.0)) {
      return 'SOUTH_INDIAN';
    }
  }

  return 'NORTH_INDIAN';
}
