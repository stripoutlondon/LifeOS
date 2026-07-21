import { readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const app = await readFile('app.js', 'utf8');

const checks = [
  [app.includes("life-os-commercial-profiles-v1"), 'commercial profiles use an isolated storage namespace'],
  [app.includes('life-os-commercial-data:'), 'commercial profile data uses an isolated storage namespace'],
  [!app.includes('LEGACY_STORAGE_KEY'), 'commercial build does not migrate the personalised prototype'],
  [html.includes('id="cloudProfileChoice"'), 'new cloud accounts receive an explicit import-or-start-fresh choice'],
  [html.includes('Nothing is copied automatically'), 'account choice explains that data is not copied automatically'],
  [html.includes('id="daytimeChecks"') && html.includes('id="dayProgress"'), 'editable daytime productivity is present'],
  [html.includes('id="settingsMorningRoutine"') && html.includes('id="settingsDaytimeRoutine"'), 'routine settings are editable'],
  [html.includes('id="customHabitForm"') && html.includes('id="weeklyInsights"'), 'custom habits and weekly insights are present'],
  [html.includes('e.g. Alex') && html.includes('e.g. Smith'), 'onboarding examples are neutral'],
  [!html.includes('placeholder="The Thornton Way"'), 'commercial onboarding has no Thornton-specific placeholder'],
  [app.includes('pendingFreshCloudProfile=true'), 'fresh cloud profiles are created only after explicit selection'],
];

const failed = checks.filter(([passed]) => !passed).map(([, message]) => message);
if (failed.length) throw new Error(`Commercial safety checks failed: ${failed.join('; ')}`);
console.log(`Commercial checks passed: ${checks.length} isolation and onboarding safeguards.`);
