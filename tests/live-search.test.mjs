import test from 'node:test';
import assert from 'node:assert/strict';
import {createLatestSearchQueue,createDebouncedSearch} from '../src/live-search.mjs';

test('only one worker request runs and queued input is replaced by the newest query',()=>{
  const sent=[],shown=[];const queue=createLatestSearchQueue({send:r=>sent.push(r),onResult:r=>shown.push(r)});
  queue.submit({query:'피'});queue.submit({query:'피카'});queue.submit({query:'피카츄'});
  assert.equal(sent.length,1);
  queue.receive({id:sent[0].id,total:200});
  assert.equal(shown.length,0);assert.equal(sent.length,2);assert.equal(sent[1].query,'피카츄');
  queue.receive({id:sent[1].id,total:966});
  assert.equal(shown.length,1);assert.equal(shown[0].total,966);
});
test('typing invalidates an old response before the debounce period has elapsed',()=>{
  const sent=[],shown=[];const queue=createLatestSearchQueue({send:r=>sent.push(r),onResult:r=>shown.push(r)});
  queue.submit({query:'old'});queue.invalidate();queue.receive({id:sent[0].id,total:1});
  assert.equal(shown.length,0);queue.submit({query:'new'});assert.equal(sent[1].query,'new');
});
test('reset discards pending work without accepting responses from a previous worker',()=>{
  const sent=[],shown=[];const queue=createLatestSearchQueue({send:r=>sent.push(r),onResult:r=>shown.push(r)});
  queue.submit({query:'old'});const old=sent[0];queue.submit({query:'queued'});queue.reset();queue.submit({query:'fresh'});
  queue.receive({id:old.id,total:5});assert.equal(shown.length,0);
  queue.receive({id:sent[1].id,total:6});assert.equal(shown[0].total,6);
});
test('rapid typing schedules one search and cancellation prevents delayed work',()=>{
  const timers=new Map();let next=0,runs=0;
  const search=createDebouncedSearch({run:()=>runs++,setTimer:callback=>{timers.set(++next,callback);return next;},clearTimer:id=>timers.delete(id)});
  search.schedule();search.schedule();search.schedule();assert.equal(timers.size,1);
  [...timers.values()][0]();assert.equal(runs,1);
  timers.clear();search.schedule();search.cancel();assert.equal(timers.size,0);
});
