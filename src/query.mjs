export class QueryError extends Error {constructor(message,position=0){super(message);this.position=position;}}
const numberFields={hp:0,atk:1,def:2,spa:3,spatk:3,spd:4,spdef:4,spe:5,speed:5};
const fields=new Set([...Object.keys(numberFields),'bst','head','body','type','tag','artist','id','name','custom']);
export function lexQuery(source){
  const tokens=[];let i=0;
  while(i<source.length){
    if(/\s/u.test(source[i])){i++;continue;}
    const start=i,c=source[i];
    if(c==='('||c===')'){tokens.push({kind:c,value:c,start,end:++i});continue;}
    let match=source.slice(i).match(/^([a-z][\w-]*):\s*(>=|<=|!=|>|<|=)?\s*/i);
    let field,op;
    if(match){field=match[1].toLowerCase();op=match[2]||'=';i+=match[0].length;}
    let value='';
    if(source[i]==='"'){
      i++;let closed=false;
      while(i<source.length){if(source[i]==='"'){i++;closed=true;break;}if(source[i]==='\\'&&i+1<source.length)i++;value+=source[i++];}
      if(!closed)throw new QueryError('Unclosed quote',start);
    }else{while(i<source.length&&!/[\s()]/u.test(source[i]))value+=source[i++];}
    if(!value)throw new QueryError('Expected a value',start);
    const upper=value.toUpperCase();const kind=!field&&['AND','OR','NOT'].includes(upper)?upper:'term';
    tokens.push({kind,value,field,op,start,end:i});
  }
  return tokens;
}
export function compileQuery(source,{types={},tags=[],nameMatcher}={}){
  const tokens=lexQuery(source);let cursor=0;
  const aliases=new Map(Object.entries(types).flatMap(([key,names])=>[key,...names].map(n=>[n.toLowerCase(),key])));
  const error=(message,token=tokens[cursor])=>new QueryError(message,token?.start??source.length);
  const predicate=token=>{
    let {field,value,op}=token;value=value.toLocaleLowerCase();
    if(!field)return nameMatcher?nameMatcher(value):r=>[r.name,...(r.names||[]),r.id].join(' ').toLocaleLowerCase().includes(value);
    if(!fields.has(field))throw error(`Unknown field: ${field}`,token);
    const numeric=Object.hasOwn(numberFields,field)||['bst','head','body'].includes(field);
    if(numeric){if(!/^\d+(?:\.\d+)?$/.test(value))throw error(`Expected a number: ${field}`,token);const n=Number(value);return r=>{const a=Object.hasOwn(numberFields,field)?r.stats[numberFields[field]]:r[field];return op==='>'?a>n:op==='<'?a<n:op==='>='?a>=n:op==='<='?a<=n:op==='!='?a!==n:a===n;};}
    if(!['=','!='].includes(op))throw error(`Use : or :!= for ${field}`,token);
    let match;
    if(field==='type'){if(!aliases.has(value))throw error(`Unknown type: ${value}`,token);const type=aliases.get(value);match=r=>r.types.includes(type);}
    else if(field==='tag')match=r=>r.tags.some(t=>t.toLowerCase()===value);
    else if(field==='custom'){if(!['true','false'].includes(value))throw error('custom: true / false',token);match=r=>r.custom===(value==='true');}
    else if(field==='id')match=r=>r.id.toLowerCase()===value;
    else if(field==='name')match=nameMatcher?nameMatcher(value):r=>[r.name,...r.names].some(n=>n.toLowerCase().includes(value));
    else match=r=>(r.artist||'').toLowerCase().includes(value);
    return op==='!='?r=>!match(r):match;
  };
  function atom(){const t=tokens[cursor++];if(!t)throw error('Expected a condition');if(t.kind==='NOT'){const a=atom();return r=>!a(r);}if(t.kind==='('){const a=or();if(tokens[cursor]?.kind!==')')throw error('Missing closing parenthesis');cursor++;return a;}if(t.kind!=='term')throw error('Expected a condition',t);return predicate(t);}
  function and(){let a=atom();while(cursor<tokens.length&&tokens[cursor].kind!==')'&&tokens[cursor].kind!=='OR'){if(tokens[cursor].kind==='AND')cursor++;const b=atom(),left=a;a=r=>left(r)&&b(r);}return a;}
  function or(){let a=and();while(tokens[cursor]?.kind==='OR'){cursor++;const b=and(),left=a;a=r=>left(r)||b(r);}return a;}
  const test=tokens.length?or():()=>true;
  if(cursor!==tokens.length)throw error('Unexpected closing parenthesis');
  return {test,tokens};
}
