import { readFile } from 'node:fs/promises';

const html = await readFile('index.html','utf8');
const app = await readFile('app.js','utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const duplicateIds = [...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
const usedIds = [...app.matchAll(/getElementById\('([^']+)'\)/g)].map(match=>match[1]);
const missingIds = [...new Set(usedIds.filter(id=>!ids.includes(id)))];

for (const asset of ['privacy.html','support.html','manifest.webmanifest','commercial.css']) {
  if (!(await readFile(asset,'utf8')).trim()) throw new Error(`${asset} is empty`);
}

if (duplicateIds.length || missingIds.length) {
  throw new Error(JSON.stringify({ duplicateIds, missingIds }));
}

console.log(`Static checks passed: ${ids.length} unique interface IDs.`);
