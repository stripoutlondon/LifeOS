import { cp, mkdir, rm } from 'node:fs/promises';

const assets = ['index.html','privacy.html','support.html','styles.css','app.js','native.js','cloud.js','cloud-config.js','manifest.webmanifest','icon.svg','sw.js'];
await rm('www',{recursive:true,force:true});
await mkdir('www',{recursive:true});
await Promise.all(assets.map(asset=>cp(asset,`www/${asset}`)));
console.log(`Prepared ${assets.length} Life OS assets for the native app.`);
