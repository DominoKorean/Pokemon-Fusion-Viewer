const defaults={type:'',generation:'',sort:'id',legendary:false};
export function createPickerMemory(saved={}){
  let filters={...defaults};
  function update(value={}){
    filters={type:typeof value.type==='string'?value.type:'',generation:/^[1-9]\d*$/.test(String(value.generation))?String(value.generation):'',sort:['id','name','bst'].includes(value.sort)?value.sort:'id',legendary:value.legendary===true};
  }
  update(saved||{});
  return {open:role=>({role,query:'',...filters}),update,settings:()=>({...filters})};
}
