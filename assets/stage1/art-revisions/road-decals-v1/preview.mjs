import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '@playwright/test';
const dir=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
const names=['Chalk festival mural','Lantern-reflection puddle','Iron manhole cover','Crack with flat weed','Flower petals','Spilled spice powder','Firework scorch mark','Confetti scatter','Chalk hopscotch','Fountain wet ring'];
const cards=manifest.files.map((a,i)=>`<article><header><b>${String(i+1).padStart(2,'0')} · ${names[i]}</b><span>${a.width} × ${a.height}</span></header><div class="art"><img width="${a.width}" height="${a.height}" src="data:image/png;base64,${fs.readFileSync(path.join(dir,a.file)).toString('base64')}" alt="${names[i]}"></div></article>`).join('');
const html=`<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#14182a;color:#f7dcad;font:14px 'Segoe UI',sans-serif;padding:22px;width:800px}h1{margin:0 0 6px;font-size:23px;color:#ffc26b}p{margin:0 0 18px;color:#9ba5c0;font-size:12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}article{border:1px solid #3b4058;background:#1c2135;border-top:2px solid #b55178}header{padding:9px 11px;display:flex;justify-content:space-between;gap:6px;font-size:12px}header span{color:#91bcc0;white-space:nowrap}.art{height:116px;display:flex;align-items:center;justify-content:center;background-color:#22283c;background-image:conic-gradient(#293046 25%,transparent 0 50%,#293046 0 75%,transparent 0);background-size:16px 16px}img{display:block;image-rendering:pixelated}</style></head><body><h1>FESTIVAL NIGHT · ROAD DECALS</h1><p>Native-size preview · Transparent PNGs · Flat ground overlays</p><div class="grid">${cards}</div></body></html>`;
fs.writeFileSync(path.join(dir,'preview.html'),html);
const browser=await chromium.launch({channel:'msedge',headless:true});
try{const page=await browser.newPage({viewport:{width:800,height:940},deviceScaleFactor:2});await page.setContent(html);await page.waitForFunction(()=>[...document.images].every(i=>i.complete&&i.naturalWidth));await page.screenshot({path:path.join(dir,'preview.png'),fullPage:true});}finally{await browser.close();}
console.log('Saved the ten-decal contact sheet at their actual game sizes.');
