import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('the committed social preview really is a 1200×630 JPEG, as declared by metadata',async()=>{
  const bytes=await readFile(new URL('../public/social/preview.jpg',import.meta.url));
  assert.equal(bytes.readUInt16BE(0),0xffd8);
  let dimensions;
  for(let i=2;i<bytes.length;){
    assert.equal(bytes[i],0xff);while(bytes[i]===0xff)i++;
    const marker=bytes[i++];if(marker===0xd9||marker===0xda)break;
    const length=bytes.readUInt16BE(i);
    if([0xc0,0xc1,0xc2].includes(marker)){dimensions=[bytes.readUInt16BE(i+5),bytes.readUInt16BE(i+3)];break;}
    i+=length;
  }
  assert.deepEqual(dimensions,[1200,630]);
});
test('published icon sizes and manifest paths agree',async()=>{
  for(const [file,size] of [['icon-96',96],['icon-192',192],['icon-512',512],['apple-touch-icon',180]]){
    const bytes=await readFile(new URL(`../public/icons/${file}.png`,import.meta.url));
    assert.equal(bytes.toString('ascii',1,4),'PNG');assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size);
  }
  const manifest=JSON.parse(await readFile(new URL('../public/site.webmanifest',import.meta.url)));
  assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
  for(const icon of manifest.icons)assert.ok((await readFile(new URL('../public/'+icon.src,import.meta.url))).length>0);
});
