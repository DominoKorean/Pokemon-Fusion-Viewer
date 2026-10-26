export function bookmarkKey({head,body,alt='',custom,variant,triple}){
  if(triple)return `triple:${triple}`;
  return `${head}.${body}${alt}:${Boolean(custom??variant?.id)?'custom':'auto'}`;
}
