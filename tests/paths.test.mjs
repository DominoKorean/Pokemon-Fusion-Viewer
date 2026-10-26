import test from 'node:test';
import assert from 'node:assert/strict';
import {assetURL} from '../src/paths.mjs';

test('data and worker URLs stay under a GitHub Pages project directory',()=>{
  const moduleURL='https://example.github.io/Pokemon-Fusion-Viewer/src/paths.mjs';
  assert.equal(assetURL('data/catalog.json',moduleURL).href,'https://example.github.io/Pokemon-Fusion-Viewer/data/catalog.json');
  assert.equal(assetURL('data/search-index.json',moduleURL).href,'https://example.github.io/Pokemon-Fusion-Viewer/data/search-index.json');
  assert.equal(assetURL('data/sprites/22.json',moduleURL).href,'https://example.github.io/Pokemon-Fusion-Viewer/data/sprites/22.json');
  assert.equal(assetURL('src/search-worker.mjs',moduleURL).href,'https://example.github.io/Pokemon-Fusion-Viewer/src/search-worker.mjs');
});

test('the same URLs work on a root domain and localhost',()=>{
  assert.equal(assetURL('data/catalog.json','https://example.com/src/paths.mjs').href,'https://example.com/data/catalog.json');
  assert.equal(assetURL('src/search-worker.mjs','http://127.0.0.1:5173/src/paths.mjs').href,'http://127.0.0.1:5173/src/search-worker.mjs');
});
