export async function exportText(name: string, text: string, mime='application/json') {
  const url=URL.createObjectURL(new Blob([text],{type:mime}));
  const a=document.createElement('a'); a.href=url; a.download=name; a.click(); URL.revokeObjectURL(url);
}
export async function importText(): Promise<string|null> {
  return new Promise(resolve=>{ const el=document.createElement('input');el.type='file';el.accept='.json,.csv';el.onchange=async()=>resolve(el.files?.[0]?await el.files[0].text():null);el.oncancel=()=>resolve(null);el.click(); });
}
export async function pickPhoto(): Promise<string|undefined> { return new Promise(resolve=>{const el=document.createElement('input');el.type='file';el.accept='image/*';el.onchange=()=>{if(!el.files?.[0]) return resolve(undefined);const r=new FileReader();r.onload=()=>resolve(String(r.result));r.readAsDataURL(el.files[0]);};el.oncancel=()=>resolve(undefined);el.click();}); }
export async function portablePhoto(uri:string) { return uri; }
