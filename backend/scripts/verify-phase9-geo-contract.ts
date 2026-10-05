/**
 * ASTROWORLD — Phase 9 Geo/Timezone Contract
 */

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), '..');
const geo = fs.readFileSync(path.join(root, 'backend/src/routes/geoRoutes.ts'), 'utf8');
const client = fs.readFileSync(path.join(root, 'frontend/src/services/geoService.ts'), 'utf8');
const picker = fs.readFileSync(path.join(root, 'frontend/src/components/CityAutocompleteInput.tsx'), 'utf8');

const checks: Array<[string, boolean, string]> = [
  [
    'Autocomplete does not guess timezones by country',
    !geo.includes('America/New_York') &&
      !geo.includes('Europe/London') &&
      !geo.includes('Asia/Dubai') &&
      !geo.includes('Australia/Sydney') &&
      !geo.includes('Asia/Tokyo') &&
      !geo.includes('Europe/Paris'),
    'Country-level timezone fallbacks must not return misleading IANA identifiers.',
  ],
  [
    'Autocomplete does not invent fallback coordinates',
    !geo.includes('20.5937') &&
      !geo.includes('78.9629') &&
      !geo.includes('28.6139') &&
      !geo.includes('77.2090'),
    'Geocoder results must come from actual provider coordinates.',
  ],
  [
    'Dedicated timezone endpoint exists',
    geo.includes("geoRouter.get('/timezone'"),
    'Timezone lookup must be explicit and deferred until location selection.',
  ],
  [
    'Timezone API returns an IANA identifier',
    geo.includes('data.timeZoneId') && geo.includes('timezone,'),
    'Resolved location timezone must be an explicit IANA timezone id.',
  ],
  [
    'Frontend resolves timezone after selection',
    client.includes('resolveTimezoneForCoordinates') &&
      picker.includes('resolveTimezoneForCoordinates'),
    'Browser should make one deferred timezone request for the selected coordinates.',
  ],
  [
    'Frontend preserves six-decimal coordinates',
    picker.includes('toFixed(6)'),
    'Birth coordinates should not be unnecessarily rounded to four decimals.',
  ],
  [
    'Unresolved timezone is never silently defaulted',
    picker.includes("timezone: timezone || ''"),
    'A missing timezone must remain visible as unresolved and fail later validation.',
  ],
];

let passed = 0;
let failed = 0;
for (const [name, pass, detail] of checks) {
  if (pass) {
    passed++;
    console.log('✅ ' + name);
  } else {
    failed++;
    console.error('❌ ' + name + ' — ' + detail);
  }
}

console.log('\n==================================================');
console.log('PHASE 9 GEO CONTRACT: ' + passed + ' PASSED | ' + failed + ' FAILED');
console.log('==================================================');

if (failed > 0) process.exitCode = 1;
