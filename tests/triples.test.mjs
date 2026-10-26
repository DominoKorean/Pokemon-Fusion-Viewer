import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { extractTriples } from '../scripts/triple-data.mjs';

const pokemon = [1, 4, 7, 144, 145, 146].map(id => ({ id }));
const types = ['fire', 'water', 'grass', 'ice', 'electric', 'flying'].map(key => ({ key }));
const stats = { HP: 45, ATTACK: 52, DEFENSE: 65, SPECIAL_ATTACK: 65, SPECIAL_DEFENSE: 65, SPEED: 65 };
const record = (gameId = 1000011, key = 'TRIPLE_KANTO1') => ({
  '@id_number': gameId, '@id': key, '@real_name': 'Bulbmantle',
  '@type1': 'FIREWATERGRASS', '@type2': 'FIREWATERGRASS', '@base_stats': stats,
  '@abilities': ['CHLOROPHYLL', 'SOLARPOWER'], '@real_pokedex_entry': 'Official description.',
});
const source = arms => `def get_triple_fusion_components(species_id)\n  case species_id\n${arms}\n  else\n    return [000]\n  end\nend\n`;
const arm = (offset, components, comment = '') => `  when Settings::ZAPMOLCUNO_NB${offset ? ` + ${offset}` : ''} ${comment}\n    return [${components}]`;
const files = new Set(['Graphics/Battlers/special/1.4.7.png', 'Graphics/Battlers/special/144.145.146.png']);
const extract = overrides => extractTriples({ species: { first: record() }, componentsSource: source(arm(12, '1, 4, 7')), files, pokemon, types, ...overrides });

test('extracts official fixed stats and splits compound types without averaging components', () => {
  assert.deepEqual(extract(), [{
    id: '1.4.7', gameId: 1000011, key: 'TRIPLE_KANTO1', name: 'Bulbmantle',
    components: [1, 4, 7], types: ['fire', 'water', 'grass'], stats: [45, 52, 65, 65, 65, 65],
    abilities: ['CHLOROPHYLL', 'SOLARPOWER'], description: 'Official description.',
    spritePath: 'Graphics/Battlers/special/1.4.7.png',
  }]);
});

test('supports the base case, keeps fourth normal type, and deduplicates Ruby hash aliases', () => {
  const bird = { ...record(999999, 'ZAPMOLTICUNO'), '@type1': 'ICEFIREELECTRIC', '@type2': 'FLYING' };
  const result = extract({ species: { 999999: bird, ZAPMOLTICUNO: bird, duplicate: { ...bird, '@id_number': 1000001 } }, componentsSource: source(`${arm(0, '144,145,146')}\n${arm(2, '144,145,146')}`) });
  assert.equal(result.length, 1);
  assert.equal(result[0].gameId, 999999);
  assert.deepEqual(result[0].types, ['ice', 'fire', 'electric', 'flying']);
});

test('excludes bosses, cardboard, sentinels, unknown components and absent sprites', () => {
  const species = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i, record(999999 + i, ['BIRDBOSS', 'SILVERBOSS_2', 'TYRANTRUM_CARDBOARD', 'EMPTY', 'SENTINEL', 'UNKNOWN', 'MISSING', 'NO_MAPPING'][i])]));
  const componentsSource = source([arm(0, '1,4,7'), arm(1, '1,4,7', '#birdBoss middle'), arm(2, '1,4,7'), arm(3, ''), arm(4, '000'), arm(5, '1,4,999'), arm(6, '7,4,1')].join('\n'));
  assert.deepEqual(extract({ species, componentsSource }), []);
});

test('reads only literal component mappings inside the official component method', () => {
  const componentsSource = `${source(arm(12, '1,4,7'))}\ndef unrelated\n${arm(12, '7,4,1')}\nend\n`;
  assert.equal(extract({ componentsSource })[0].id, '1.4.7');
  assert.deepEqual(extract({ componentsSource: source(arm(12, '1,4,7 + injected()')) }), []);
});

test('fails on unrecognized official type tokens instead of inventing ordinary types', () => {
  assert.throws(() => extract({ species: { first: { ...record(), '@type2': 'MYSTERY' } } }), /type/i);
});

test('shipped triples preserve official Bulbmantle data and source provenance', async () => {
  const data = JSON.parse(await readFile(new URL('../public/data/triples.json', import.meta.url), 'utf8'));
  assert.equal(data.triples.length, 23);
  assert.equal(new Set(data.triples.map(t => t.id)).size, 23);
  assert.equal(new Set(data.triples.map(t => t.gameId)).size, 23);
  const bulbmantle = data.triples.find(t => t.id === '1.4.7');
  assert.deepEqual(bulbmantle.stats, [45, 52, 65, 65, 65, 65]);
  assert.deepEqual(bulbmantle.types, ['fire', 'water', 'grass']);
  assert.equal(bulbmantle.name, 'Bulbmantle');
  assert.equal(bulbmantle.gameId, 1000011);
  assert.equal(data.metadata.sources.length, 3);
  assert.ok(Number.isFinite(Date.parse(data.metadata.retrievedAt)));
  assert.ok(data.metadata.sources.every(s => /^https:\/\//.test(s.url) && /^[a-f0-9]{64}$/.test(s.sha256)));
  assert.ok(data.triples.every(t => t.components.every(id => Number.isInteger(id) && id > 0 && id <= 501)));
});
