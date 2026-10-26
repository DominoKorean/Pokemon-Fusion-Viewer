import { mkdir,writeFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readMarshal} from './ruby-marshal.mjs';
import {parseCSV} from './csv.mjs';
import {deriveSpriteInventory} from '../src/dex-data.mjs';

const ROOT=new URL('../public/data/',import.meta.url);
const game='https://raw.githubusercontent.com/infinitefusion/infinitefusion-e18/main/';
const poke='https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/';
const spriteRepo='https://raw.githubusercontent.com/infinitefusion/infinitefusion-hoenn-public/main/';
const definitions={
  species:game+'Data/species.dat',
  names:poke+'pokemon_species_names.csv', speciesInfo:poke+'pokemon_species.csv',
  types:poke+'types.csv',typeNames:poke+'type_names.csv',
  natures:poke+'natures.csv',natureNames:poke+'nature_names.csv',
  stats:poke+'stats.csv',statNames:poke+'stat_names.csv',
  abilities:poke+'abilities.csv',abilityNames:poke+'ability_names.csv',
  split:'https://raw.githubusercontent.com/infinitefusion/scripts/main/052_InfiniteFusion/Fusion/Data/SplitNames.rb',
  credits:spriteRepo+'Data/sprites/Sprite%20Credits.csv',
  customSpriteInventory:spriteRepo+'Data/sprites/CUSTOM_SPRITES',
  sheetFiles:'https://api.github.com/repos/infinitefusion/infinitefusion-hoenn-public/git/trees/main?recursive=1',
};
const sources=[];
async function download([key,url]){
  const r=await fetch(url,{signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error(`${key}: HTTP ${r.status}`);
  const bytes=new Uint8Array(await r.arrayBuffer());sources.push({key,url,sha256:createHash('sha256').update(bytes).digest('hex')});
  return [key,key==='species'?readMarshal(bytes):new TextDecoder().decode(bytes)];
}
const raw=Object.fromEntries(await Promise.all(Object.entries(definitions).map(download)));
const languages={en:'9',ko:'3',ja:'1'};
const normalize=s=>s.normalize('NFKD').replaceAll('♀','f').replaceAll('♂','m').replace(/[^a-z0-9]/gi,'').toLowerCase();
const speciesInfo=parseCSV(raw.speciesInfo), nameRows=parseCSV(raw.names);
const nameLookup=new Map();
for(const row of nameRows){if(!nameLookup.has(+row.pokemon_species_id))nameLookup.set(+row.pokemon_species_id,{});for(const [lang,id]of Object.entries(languages))if(row.local_language_id===id)nameLookup.get(+row.pokemon_species_id)[lang]=row.name;}
const sortedSpecies=[...speciesInfo].sort((a,b)=>b.identifier.length-a.identifier.length);
const splits=[...raw.split.matchAll(/\["([^"]*)",\s*"([^"]*)"\]/g)].map(m=>[m[1],m[2]]);
const statSymbols=['HP','ATTACK','DEFENSE','SPECIAL_ATTACK','SPECIAL_DEFENSE','SPEED'];
const seen=new Set();const pokemon=[];
for(const p of Object.values(raw.species)){
  const id=p?.['@id_number'];if(!id||id>1000||seen.has(id))continue;seen.add(id);
  const internal=normalize(p['@id']),english=p['@real_name'],canonical=normalize(english);
  const species=sortedSpecies.find(s=>normalize(s.identifier)===internal||normalize(nameLookup.get(+s.id)?.en||'')===canonical)
    ||sortedSpecies.find(s=>internal.startsWith(normalize(s.identifier))||canonical.startsWith(normalize(s.identifier)));
  if(!species)throw Error(`No PokeAPI species mapping for ${id}: ${english}`);
  const names=nameLookup.get(+species.id);
  pokemon.push({id,nationalId:+species.id,identifier:p['@id'],names:{...names,en:english},form:p['@real_form_name']||'',generation:+species.generation_id,legendary:species.is_legendary==='1'||species.is_mythical==='1',types:[...new Set([p['@type1'],p['@type2']].map(t=>t.toLowerCase()))],stats:statSymbols.map(k=>p['@base_stats'][k]),split:splits[+species.id],abilities:p['@abilities'],description:p['@real_pokedex_entry'],evolutions:p['@evolutions'].filter(e=>!e[3]).map(e=>({species:e[0],method:e[1],parameter:e[2]}))});
}
pokemon.sort((a,b)=>a.id-b.id);
function namedRows(items,names,idField){
  const rows=parseCSV(names);return parseCSV(items).map(r=>({...r,names:Object.fromEntries(Object.entries(languages).map(([lang,id])=>[lang,rows.find(n=>n[idField]===r.id&&n.local_language_id===id)?.name||r.identifier]))}));
}
const types=namedRows(raw.types,raw.typeNames,'type_id').filter(t=>+t.id<=18).map(t=>({id:+t.id,key:t.identifier,names:t.names}));
const stats=namedRows(raw.stats,raw.statNames,'stat_id').filter(s=>+s.id<=6).map(s=>({id:+s.id,key:s.identifier,names:s.names}));
const natures=namedRows(raw.natures,raw.natureNames,'nature_id').map(n=>({id:+n.id,key:n.identifier,names:n.names,up:+n.increased_stat_id-1,down:+n.decreased_stat_id-1}));
const abilities=namedRows(raw.abilities,raw.abilityNames,'ability_id').map(a=>({key:a.identifier.replaceAll('-','').toUpperCase(),names:a.names}));
const sheetTree=JSON.parse(raw.sheetFiles);if(sheetTree.truncated||!Array.isArray(sheetTree.tree))throw Error('Incomplete official sprite file inventory');
const sheetFiles=new Set(sheetTree.tree.map(f=>f.path));
const customSheets={};
for(const file of sheetFiles){const m=file.match(/^Graphics\/CustomBattlers\/spritesheets\/spritesheets_custom\/(\d+)\/\d+([a-z]*)\.png$/);if(m)(customSheets[m[1]]??=[]).push(m[2]);}
const listedSprites=new Set(raw.customSpriteInventory.split(/\r?\n/).map(name=>name.trim().replace(/\.png$/i,'')));
const byHead=new Map(), tags=new Map();let variantCount=0,unavailableVariantCount=0;
// Official credits have no header. Use the CSV reader by prepending the documented columns.
for(const r of parseCSV('sprite,artist,status,tags\n'+raw.credits)){
  const m=r.sprite.match(/^(\d+)\.(\d+)([a-z]*)$/);if(!m||!seen.has(+m[1])||!seen.has(+m[2]))continue;
  if(!sheetFiles.has(`Graphics/CustomBattlers/spritesheets/spritesheets_custom/${+m[1]}/${+m[1]}${m[3]}.png`)){unavailableVariantCount++;continue;}
  const entry={id:r.sprite,body:+m[2],alt:m[3],artist:r.artist,status:r.status,tags:r.tags.split(';').filter(Boolean)};
  if(!listedSprites.has(r.sprite))entry.listed=false;
  if(!byHead.has(+m[1]))byHead.set(+m[1],[]);byHead.get(+m[1]).push(entry);variantCount++;
  for(const tag of entry.tags)tags.set(tag,(tags.get(tag)||0)+1);
}
await mkdir(new URL('sprites/',ROOT),{recursive:true});
for(const [head,entries]of byHead)await writeFile(new URL(`sprites/${head}.json`,ROOT),JSON.stringify(entries));
const metadata={retrievedAt:new Date().toISOString(),gameDatabase:'infinitefusion/infinitefusion-e18',speciesCount:pokemon.length,variantCount,unavailableVariantCount,customSheets,sources,spriteBase:spriteRepo,formulaSource:'https://github.com/infinitefusion/scripts/blob/main/052_InfiniteFusion/Fusion/Data/FusedSpecies.rb',tags:[...tags].sort((a,b)=>b[1]-a[1]).map(([key,count])=>({key,count})),heads:[...byHead].map(([id,entries])=>({id,count:entries.length}))};
const artists=[...new Set([...byHead.values()].flat().map(s=>s.artist))],tagKeys=[...tags.keys()];
const artistIds=new Map(artists.map((a,i)=>[a,i])),tagIds=new Map(tagKeys.map((a,i)=>[a,i]));
const rows=[...byHead].flatMap(([head,entries])=>entries.map(s=>[head,s.body,s.alt,artistIds.get(s.artist),s.tags.map(t=>tagIds.get(t)),s.status,...(s.listed===false?[false]:[])]));
Object.assign(metadata,deriveSpriteInventory({tags:tagKeys,rows}),{unlistedVariantCount:rows.filter(r=>r[6]===false).length,inventoryCheckedAt:new Date().toISOString()});
await writeFile(new URL('search-index.json',ROOT),JSON.stringify({artists,tags:tagKeys,rows}));
const catalog={metadata,pokemon,types,stats,natures,abilities};
await writeFile(new URL('catalog.json',ROOT),JSON.stringify(catalog));
console.log(`Imported ${pokemon.length} official species, ${variantCount} credited sprites, ${tags.size} external tags. Sources recorded with SHA-256.`);
