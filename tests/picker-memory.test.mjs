import test from 'node:test';
import assert from 'node:assert/strict';
import {createPickerMemory} from '../src/picker-memory.mjs';
test('picker filters survive closing and reopening for another parent without keeping the query',()=>{
  const memory=createPickerMemory();const head=memory.open('head');
  Object.assign(head,{type:'fire',generation:'3',sort:'bst',legendary:true,query:'Char'});memory.update(head);
  assert.deepEqual(memory.open('body'),{role:'body',query:'',type:'fire',generation:'3',sort:'bst',legendary:true});
  assert.deepEqual(memory.settings(),{type:'fire',generation:'3',sort:'bst',legendary:true});
});
test('invalid stored picker settings are normalized instead of hiding every result',()=>{
  const memory=createPickerMemory({type:42,generation:'oops',sort:'invalid',legendary:'false'});
  assert.deepEqual(memory.settings(),{type:'',generation:'',sort:'id',legendary:false});
});
