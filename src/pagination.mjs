export function paginationWindow(page,total){
  if(total<1)return [];
  const current=Math.max(1,Math.min(page,total));
  const start=Math.max(1,Math.min(current-2,total-4));
  return Array.from({length:Math.min(5,total)},(_,index)=>start+index);
}
export function parsePageNumber(text,total){
  const value=text.trim();
  if(!/^\d+$/.test(value))return null;
  const page=Number(value);
  return Number.isSafeInteger(page)&&page>=1&&page<=total?page:null;
}
