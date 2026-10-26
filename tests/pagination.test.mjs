import test from 'node:test';
import assert from 'node:assert/strict';
import {paginationWindow,parsePageNumber} from '../src/pagination.mjs';

test('page numbers show the first five, then follow the current page, then stop at the last page',()=>{
  assert.deepEqual(paginationWindow(1,100),[1,2,3,4,5]);
  assert.deepEqual(paginationWindow(4,100),[2,3,4,5,6]);
  assert.deepEqual(paginationWindow(50,100),[48,49,50,51,52]);
  assert.deepEqual(paginationWindow(100,100),[96,97,98,99,100]);
});

test('direct page entry accepts whole pages within the current result range',()=>{
  assert.equal(parsePageNumber('42',100),42);
  assert.equal(parsePageNumber(' 001 ',100),1);
  assert.equal(parsePageNumber('10459',10459),10459);
  for(const value of ['', '0', '-1', '1.5', '1e2', '101', 'abc', '1,000'])assert.equal(parsePageNumber(value,100),null,value);
  assert.equal(parsePageNumber('1',0),null);
});

test('small result sets and out-of-range pages never produce invalid page buttons',()=>{
  assert.deepEqual(paginationWindow(1,1),[1]);
  assert.deepEqual(paginationWindow(2,3),[1,2,3]);
  assert.deepEqual(paginationWindow(0,8),[1,2,3,4,5]);
  assert.deepEqual(paginationWindow(99,8),[4,5,6,7,8]);
  assert.deepEqual(paginationWindow(1,0),[]);
});
