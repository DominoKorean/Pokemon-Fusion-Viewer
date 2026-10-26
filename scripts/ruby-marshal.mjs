// Read data only; never evaluate Ruby classes or execute source from the database.
export function readMarshal(input) {
  const data = new Uint8Array(input); let pos=0;
  const symbols=[], objects=[], decoder=new TextDecoder();
  const byte=()=>{if(pos>=data.length)throw Error('Truncated Marshal data');return data[pos++];};
  const int=()=>{let n=byte();if(n>127)n-=256;if(n===0)return 0;if(n>4)return n-5;if(n< -4)return n+5;let value=n<0?-1:0;for(let i=0;i<Math.abs(n);i++){value=(value & ~(255<<(i*8)))|(byte()<<(i*8));}return value;};
  const string=()=>{const n=int();if(n<0||pos+n>data.length)throw Error('Invalid Marshal string');const s=decoder.decode(data.subarray(pos,pos+n));pos+=n;return s;};
  function pairs(target,n){for(let i=0;i<n;i++){const key=read();Object.defineProperty(target,String(key),{value:read(),enumerable:true,writable:true,configurable:true});}return target;}
  function read(){const type=String.fromCharCode(byte());switch(type){
    case '0':return null;case 'T':return true;case 'F':return false;case 'i':return int();
    case ':':{const s=string();symbols.push(s);return s;}
    case ';':{const i=int();if(i<0||i>=symbols.length)throw Error('Invalid symbol link');return symbols[i];}
    case '@':{const i=int();if(i<0||i>=objects.length)throw Error('Invalid object link');return objects[i];}
    case '"':{const s=string();objects.push(s);return s;}
    case '[':{const a=[];objects.push(a);const n=int();for(let i=0;i<n;i++)a.push(read());return a;}
    case '{':case '}':{const o={};objects.push(o);pairs(o,int());if(type==='}')read();return o;}
    case 'o':{const klass=read();const o={__class:klass};objects.push(o);return pairs(o,int());}
    case 'I':{const value=read();const n=int();for(let i=0;i<n;i++){read();read();}return value;}
    case 'f':{const s=string();const n=Number(s);objects.push(n);return n;}
    default:throw Error(`Unsupported Marshal type ${type} at ${pos-1}`);
  }}
  if(byte()!==4||byte()!==8)throw Error('Expected Ruby Marshal 4.8');
  const result=read();if(pos!==data.length)throw Error('Trailing Marshal data');return result;
}
