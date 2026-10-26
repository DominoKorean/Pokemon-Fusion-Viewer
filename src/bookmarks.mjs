export function bookmarkKey({head,body,alt='',custom,variant}){
  return `${head}.${body}${alt}:${Boolean(custom??variant?.id)?'custom':'auto'}`;
}
