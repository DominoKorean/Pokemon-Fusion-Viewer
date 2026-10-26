export function createSearchState(saved={}){
  return Object.fromEntries(['simple','advanced'].map(mode=>[mode,{input:typeof saved[mode]?.input==='string'?saved[mode].input:'',applied:typeof saved[mode]?.applied==='string'?saved[mode].applied:'',history:Array.isArray(saved[mode]?.history)?saved[mode].history.filter(v=>typeof v==='string').slice(0,8):[]}]));
}
export function applySearch(state,mode){const search=state[mode];search.applied=search.input.trim();if(search.applied)search.history=[search.applied,...search.history.filter(q=>q!==search.applied)].slice(0,8);return search.applied;}
export function switchSearchMode(state,mode){return state[mode];}
