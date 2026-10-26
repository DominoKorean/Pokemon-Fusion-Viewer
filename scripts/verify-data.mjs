import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {deriveSpriteInventory} from '../src/dex-data.mjs';
const d=JSON.parse(await readFile(new URL('../public/data/catalog.json',import.meta.url),'utf8'));
const index=JSON.parse(await readFile(new URL('../public/data/search-index.json',import.meta.url),'utf8'));
const unlisted=new Set(index.rows.filter(r=>r[6]===false).map(([h,b,a])=>`${h}.${b}${a}`));
assert.equal(unlisted.size,d.metadata.unlistedVariantCount);
for(const [key,value] of Object.entries(deriveSpriteInventory(index)))assert.deepEqual(d.metadata[key],value,`Inventory classification: ${key}`);
const ids=new Set(d.pokemon.map(p=>p.id));
assert.equal(ids.size,d.pokemon.length);
assert.ok(d.pokemon.length>400);
for(const p of d.pokemon){assert.ok(p.names.ko&&p.names.en&&p.names.ja,`Names: ${p.id}`);assert.equal(p.stats.length,6);assert.ok(p.stats.every(v=>Number.isInteger(v)&&v>0&&v<=255));assert.ok(p.types.every(t=>d.types.some(known=>known.key===t)));}
let count=0;
for(const h of d.metadata.heads){const sprites=JSON.parse(await readFile(new URL(`../public/data/sprites/${h.id}.json`,import.meta.url),'utf8'));assert.equal(sprites.length,h.count);for(const s of sprites){assert.ok(ids.has(s.body));assert.equal(s.listed===false,unlisted.has(s.id),`Availability: ${s.id}`);assert.ok(s.id.startsWith(h.id+'.'));assert.equal(typeof s.artist,'string');assert.ok(d.metadata.customSheets[h.id].includes(s.alt),`Unavailable sprite sheet: ${s.id}`);}count+=sprites.length;}
assert.equal(count,d.metadata.variantCount);
assert.equal(d.metadata.mainVariantCount+d.metadata.otherVariantCount,d.metadata.variantCount);
assert.ok(d.metadata.mainTags.every(t=>t.count<=d.metadata.mainVariantCount));
assert.ok(d.metadata.otherTags.every(t=>t.count<=d.metadata.otherVariantCount));
assert.equal(d.natures.length,25);
assert.ok(d.metadata.sources.every(s=>s.url.startsWith('https://')&&s.sha256.length===64));
console.log(`Verified ${ids.size} species, ${count} sprites, 25 natures, localized names and source hashes.`);
