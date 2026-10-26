const TRIPLE_BASE = 999999;
const STAT_KEYS = ['HP', 'ATTACK', 'DEFENSE', 'SPECIAL_ATTACK', 'SPECIAL_DEFENSE', 'SPEED'];

// Parse data literals only. Never execute downloaded Ruby source.
function componentMappings(source) {
  const method = source.match(/^def get_triple_fusion_components\([^\n]*\)\s*\n([\s\S]*?)(?=^def |$(?![\s\S]))/m)?.[1];
  if (!method) throw Error('Official triple component method not found');
  const mappings = new Map();
  const cases = /^\s*when Settings::ZAPMOLCUNO_NB(?:\s*\+\s*(\d+))?\s*(#[^\n]*)?\r?\n\s*return\s*\[([\d,\s]*)\]\s*(?:#[^\n]*)?\r?$/gm;
  for (const match of method.matchAll(cases)) {
    const gameId = TRIPLE_BASE + Number(match[1] || 0);
    if (mappings.has(gameId)) continue; // Ruby takes the first matching when arm.
    const components = match[3].trim() ? match[3].split(',').map(n => Number(n.trim())) : [];
    mappings.set(gameId, /boss|cardboard/i.test(match[2] || '') ? [] : components);
  }
  return mappings;
}

function ordinaryTypes(symbol, keys) {
  const remaining = String(symbol || '').toLowerCase();
  // Longest complete match first; reject unknown suffixes instead of dropping them.
  function split(value) {
    if (!value) return [];
    for (const key of keys) {
      if (!value.startsWith(key)) continue;
      const tail = split(value.slice(key.length));
      if (tail) return [key, ...tail];
    }
    return null;
  }
  const result = split(remaining);
  if (!result?.length) throw Error(`Unknown official triple type: ${symbol}`);
  return result;
}

export function extractTriples({ species, componentsSource, files, pokemon, types }) {
  const mappings = componentMappings(componentsSource);
  const knownPokemon = new Set(pokemon.map(p => p.id));
  const availableFiles = new Set([...files].map(file => typeof file === 'string' ? file : file.path));
  const typeKeys = types.map(type => type.key).sort((a, b) => b.length - a.length);
  const seenGameIds = new Set(), seenComponents = new Set(), triples = [];
  const records = Object.values(species).filter(Boolean).sort((a, b) => a['@id_number'] - b['@id_number']);
  for (const record of records) {
    const gameId = record['@id_number'], key = record['@id'];
    if (!Number.isInteger(gameId) || seenGameIds.has(gameId) || /boss|cardboard/i.test(key || '')) continue;
    seenGameIds.add(gameId);
    const components = mappings.get(gameId);
    if (components?.length !== 3 || components.some(id => !Number.isInteger(id) || id <= 0 || !knownPokemon.has(id))) continue;
    const id = components.join('.'), spritePath = `Graphics/Battlers/special/${id}.png`;
    if (seenComponents.has(id) || !availableFiles.has(spritePath)) continue;
    const stats = STAT_KEYS.map(stat => record['@base_stats']?.[stat]);
    if (stats.some(stat => !Number.isInteger(stat) || stat <= 0)) throw Error(`Invalid official triple stats: ${key}`);
    if (!key || !record['@real_name'] || !Array.isArray(record['@abilities']) || typeof record['@real_pokedex_entry'] !== 'string') throw Error(`Incomplete official triple species: ${gameId}`);
    const normalTypes = [...new Set([record['@type1'], record['@type2']].flatMap(type => ordinaryTypes(type, typeKeys)))];
    triples.push({
      id, gameId, key, name: record['@real_name'], components: [...components], types: normalTypes,
      stats, abilities: [...record['@abilities']], description: record['@real_pokedex_entry'], spritePath,
    });
    seenComponents.add(id);
  }
  return triples;
}
