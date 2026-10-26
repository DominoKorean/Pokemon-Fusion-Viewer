import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { readMarshal } from './ruby-marshal.mjs';
import { extractTriples } from './triple-data.mjs';

const fromCache = process.argv.includes('--from-cache');
const definitions = [
  { key: 'species', url: 'https://raw.githubusercontent.com/infinitefusion/infinitefusion-e18/main/Data/species.dat', cache: 'import-species.dat' },
  { key: 'components', url: 'https://raw.githubusercontent.com/infinitefusion/scripts/main/052_InfiniteFusion/Fusion/FusionUtils.rb', cache: 'import-fusionUtils.txt' },
  { key: 'spriteFiles', url: 'https://api.github.com/repos/infinitefusion/infinitefusion-hoenn-public/git/trees/main?recursive=1', cache: 'import-spriteTree.txt' },
];
const inputs = await Promise.all(definitions.map(async definition => {
  let bytes;
  if (fromCache) bytes = await readFile(new URL(`../.cache/${definition.cache}`, import.meta.url));
  else {
    const response = await fetch(definition.url, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw Error(`${definition.key}: HTTP ${response.status}`);
    bytes = new Uint8Array(await response.arrayBuffer());
  }
  return { bytes, source: { key: definition.key, url: definition.url, sha256: createHash('sha256').update(bytes).digest('hex') } };
}));
const [speciesInput, componentsInput, spriteInput] = inputs;
const catalog = JSON.parse(await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'));
const catalogSpecies = catalog.metadata.sources.find(source => source.key === 'species');
if (catalogSpecies?.sha256 !== speciesInput.source.sha256) throw Error('Triple species source differs from the catalog; sync the catalog before importing triples');
const tree = JSON.parse(new TextDecoder().decode(spriteInput.bytes));
if (tree.truncated || !Array.isArray(tree.tree)) throw Error('Incomplete official special sprite inventory');
const triples = extractTriples({
  species: readMarshal(speciesInput.bytes), componentsSource: new TextDecoder().decode(componentsInput.bytes),
  files: tree.tree.filter(file => file.type === 'blob').map(file => file.path), pokemon: catalog.pokemon, types: catalog.types,
});
if (!triples.length) throw Error('No supported official triple fusions found');
const metadata = {
  retrievedAt: new Date().toISOString(), sources: inputs.map(input => input.source),
  importedFromCache: fromCache, count: triples.length,
  policy: 'Static official species with three known catalog components and an existing official special sprite. Bosses and cardboard excluded. Compound types expanded to ordinary catalog types; database stats preserved.',
};
await writeFile(new URL('../public/data/triples.json', import.meta.url), `${JSON.stringify({ metadata, triples })}\n`);
console.log(`Imported ${triples.length} official triple fusions${fromCache ? ' from cached sources' : ''}.`);
