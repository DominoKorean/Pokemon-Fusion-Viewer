export const STAT_KEYS=['hp','atk','def','spa','spd','spe'];
export function fuseStats(head,body){return head.map((v,i)=>Math.max(1,[0,3,4].includes(i)?Math.floor(2*v/3)+Math.floor(body[i]/3):Math.floor(2*body[i]/3)+Math.floor(v/3)));}
export function fuseTypes(head,body){
  const first=head.types[0]==='normal'&&head.types[1]==='flying'?'flying':head.types[0];
  const second=body.types[1]||body.types[0];
  return [...new Set([first,second===first?body.types[0]:second])];
}
export function statCalculations(base,{level=50,iv=31,ev=[0,0,0,0,0,0],nature={},wonderGuard=false}={}){
  if(!Number.isInteger(level)||level<1||level>100)throw Error('Invalid level');
  if(!Number.isInteger(iv)||iv<0||iv>31)throw Error('Invalid IV');
  if(ev.length!==6||ev.some(v=>!Number.isInteger(v)||v<0||v>252)||ev.reduce((a,b)=>a+b,0)>510)throw Error('Invalid EV distribution');
  return base.map((v,i)=>{
    const evContribution=Math.floor(ev[i]/4),levelValue=Math.floor((2*v+iv+evContribution)*level/100);
    const beforeNature=levelValue+(i===0?level+10:5);
    const naturePercent=i===0||nature.up===nature.down?100:nature.up===i?110:nature.down===i?90:100;
    const hpException=i===0?(v===1?'baseHP':wonderGuard?'wonderGuard':null):null;
    const value=hpException?1:Math.floor(beforeNature*naturePercent/100);
    return {base:v,iv,ev:ev[i],evContribution,level,levelValue,beforeNature,naturePercent,natureDelta:hpException?0:value-beforeNature,hpException,value};
  });
}
export const actualStats=(base,settings)=>statCalculations(base,settings).map(s=>s.value);
export const statDeltas=(current,previous)=>current.map((v,i)=>v-previous[i]);
export function makeFusion(head,body,variant={},names={}){
  const stats=fuseStats(head.stats,body.stats);
  const prefix=head.split?.[0],suffix=body.split?.[1];
  const name=prefix&&suffix?(prefix.endsWith(suffix[0])?prefix.slice(0,-1):prefix)+suffix:`${head.names.en} × ${body.names.en}`;
  return {id:`${head.id}.${body.id}`,head:head.id,body:body.id,name,names:[...Object.values(head.names),...Object.values(body.names)],stats,bst:stats.reduce((a,b)=>a+b,0),types:fuseTypes(head,body),custom:Boolean(variant.id),tags:variant.tags||[],artist:variant.artist||'',variant:variant.alt||'',...names};
}
