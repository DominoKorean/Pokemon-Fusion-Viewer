// Resolve from this module, so / and /repository-name/ deployments both work.
export function assetURL(path,moduleURL=import.meta.url){
  return new URL(`../${path}`,moduleURL);
}
