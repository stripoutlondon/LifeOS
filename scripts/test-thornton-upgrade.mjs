import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const required = [
  "const LEGACY_STORAGE_KEY = 'life-os-v1'",
  "const PROFILE_STORAGE_KEY = 'life-os-profiles-v1'",
  'life-os-data:${id}',
  'function normalizeProfile(profile)',
  "wayName:'The Thornton Way'",
  "lifeMode:'both'",
  'renderDaytime()',
  'renderCustomHabits()',
  'renderWeeklyInsights()'
];

for (const marker of required) {
  if (!app.includes(marker)) throw new Error(`Thornton upgrade marker missing: ${marker}`);
}

if (app.includes('life-os-commercial-profiles-v1') || app.includes('life-os-commercial-data:')) {
  throw new Error('Commercial storage keys must not replace the personalised Thornton data.');
}

if (!sw.includes('life-os-thornton-latest-v1')) {
  throw new Error('The Thornton Latest service-worker cache was not versioned.');
}

const interfaceChecks = [
  ['id="daytimeChecks"', 'daytime productivity checks'],
  ['id="dayProgress"', 'daytime progress note'],
  ['id="settingsMorningRoutine"', 'editable morning routine'],
  ['id="settingsDaytimeRoutine"', 'editable daytime routine'],
  ['id="customHabitForm"', 'custom habits'],
  ['id="weeklyInsights"', 'weekly insights'],
  ['id="cloudProfileChoice"', 'safe cloud profile choice']
];

for (const [marker, label] of interfaceChecks) {
  if (!html.includes(marker)) throw new Error(`Thornton Latest is missing ${label}.`);
}

console.log('Thornton upgrade compatibility checks passed.');
