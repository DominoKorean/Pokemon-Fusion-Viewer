const root='https://raw.githubusercontent.com/infinitefusion/infinitefusion-hoenn-public/main/';
const cache=new Map();
function loadImage(url){
  if(cache.has(url)){const pending=cache.get(url);cache.delete(url);cache.set(url,pending);return pending;}
  const pending=new Promise((resolve,reject)=>{const img=new Image();img.crossOrigin='anonymous';img.onload=()=>resolve(img);img.onerror=()=>{cache.delete(url);reject(Error('Sprite unavailable'));};img.src=url;});
  cache.set(url,pending);if(cache.size>24)cache.delete(cache.keys().next().value);return pending;
}
const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){observer.unobserve(e.target);draw(e.target);}},{rootMargin:'180px'});
async function draw(canvas){
  const {head,body,alt,custom,national}=canvas.dataset;let url,x=0,y=0;
  if(Number(body)===0){url=`${root}Graphics/CustomBattlers/spritesheets/spritesheets_base/${head}.png`;}
  else if(custom==='true'){url=`${root}Graphics/CustomBattlers/spritesheets/spritesheets_custom/${head}/${head}${alt||''}.png`;x=Number(body)%20*96;y=Math.floor(Number(body)/20)*96;}
  else {url=`${root}Graphics/Battlers/spritesheets_autogen/${head}.png`;x=Number(body)%10*96;y=Math.floor(Number(body)/10)*96;}
  try{const image=await loadImage(url);if(!canvas.isConnected)return;if(x+96>image.width||y+96>image.height)throw Error('Outside sheet');const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,96,96);ctx.drawImage(image,x,y,96,96,0,0,96,96);canvas.dataset.loaded='true';canvas.closest('.sprite-wrap')?.classList.remove('sprite-loading');}
  catch{if(!canvas.isConnected)return;canvas.dataset.loaded='error';const wrap=canvas.closest('.sprite-wrap');wrap?.classList.remove('sprite-loading');wrap?.classList.add('sprite-error');const retry=document.createElement('button');retry.type='button';retry.className='sprite-retry';retry.textContent='↻';retry.setAttribute('aria-label',canvas.getAttribute('aria-label'));retry.onclick=()=>{retry.remove();wrap?.classList.remove('sprite-error');draw(canvas);};wrap?.append(retry);}
}
export function hydrateSprites(container=document){
  for(const canvas of container.querySelectorAll('canvas[data-sprite]:not([data-observed])')){canvas.dataset.observed='true';observer.observe(canvas);}
}
export function resetSpriteObservers(){observer.disconnect();}
