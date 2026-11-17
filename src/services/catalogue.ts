import { Exercise, ExerciseSchema } from '../model';
import { z } from 'zod';

async function json(url:string,headers:Record<string,string>={}){
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
  try{const response=await fetch(url,{headers,signal:controller.signal});if(!response.ok)throw new Error(response.status===429?'The exercise provider is rate limiting requests. Try later.':`Exercise provider returned HTTP ${response.status}.`);return await response.json();}
  finally{clearTimeout(timeout);}
}
const strip=(s:string)=>s.replace(/<\/(p|li|ol|ul)>/g,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').trim();
const WgerRow=z.object({id:z.number(),muscles:z.array(z.object({name:z.string(),name_en:z.string().optional()})),muscles_secondary:z.array(z.object({name:z.string(),name_en:z.string().optional()})),equipment:z.array(z.object({name:z.string()})),translations:z.array(z.object({name:z.string(),description:z.string(),language:z.number(),license_author:z.string().optional()})),license:z.object({full_name:z.string(),url:z.string()}),license_author:z.string(),images:z.array(z.object({image:z.string(),license_author:z.string().optional(),license:z.number().optional()}))});
export async function downloadWger(onProgress?:(n:number)=>void):Promise<Exercise[]> {
  const rows:Exercise[]=[];let offset=0;
  // Read-only exerciseinfo expands muscles, equipment and translations. Paginate politely.
  while(offset<10000){const page=z.object({results:z.array(z.unknown()),next:z.string().nullable()}).parse(await json(`https://wger.de/api/v2/exerciseinfo/?limit=100&offset=${offset}`));
    for(const raw of page.results){const p=WgerRow.safeParse(raw);if(!p.success)continue;const r=p.data;const t=r.translations.find(v=>v.language===2);if(!t)continue;
      rows.push({id:`wger-${r.id}`,name:t.name,muscles:r.muscles.map(m=>m.name_en||m.name),secondaryMuscles:r.muscles_secondary.map(m=>m.name_en||m.name),equipment:r.equipment.map(e=>e.name).join(', ')||'Not specified',instructions:strip(t.description),source:'wger',sourceUrl:`https://wger.de/api/v2/exerciseinfo/${r.id}/`,attribution:`Exercise: ${t.license_author||r.license_author}. Text converted from HTML; muscle/equipment labels normalised.`,license:`${r.license.full_name} — ${r.license.url}`});
      // Wger images can carry a different licence. Do not reuse them without resolving that licence.
    }offset+=page.results.length;onProgress?.(rows.length);if(!page.next || !page.results.length)break;
  }if(!rows.length)throw new Error('No compatible English exercise records were returned. Your saved library is unchanged.');return rows.map(e=>ExerciseSchema.parse(e));
}
const NinjaRow=z.object({name:z.string(),muscle:z.string(),equipment:z.string().optional(),equipments:z.array(z.string()).optional(),instructions:z.string()});
export async function searchNinjas(query:string,key:string):Promise<Exercise[]> {
  if(!key)throw new Error('Add your free API Ninjas key in Profile → Settings first.');
  const result=z.array(NinjaRow).parse(await json(`https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(query)}`,{'X-Api-Key':key}));
  return result.map(e=>({id:`ninjas-${e.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,name:e.name,muscles:[e.muscle.replaceAll('_',' ')],secondaryMuscles:[],equipment:e.equipments?.join(', ')||e.equipment||'Not specified',instructions:e.instructions,source:'ninjas',sourceUrl:'https://api-ninjas.com/api/exercises',attribution:'API Ninjas Exercises API — personal, noncommercial use under the free plan.',license:'API Ninjas terms: https://api-ninjas.com/terms'}));
}
const FreeRow=z.object({id:z.string(),name:z.string(),primaryMuscles:z.array(z.string()),secondaryMuscles:z.array(z.string()),equipment:z.string().nullable(),instructions:z.array(z.string()),images:z.array(z.string())});
export async function downloadFreeDb():Promise<Exercise[]> {
  const rows=z.array(FreeRow).parse(await json('https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'));
  return rows.map(e=>({id:`free-${e.id}`,name:e.name,muscles:e.primaryMuscles,secondaryMuscles:e.secondaryMuscles,equipment:e.equipment||'Not specified',instructions:e.instructions.join('\n\n'),image:e.images[0]?`https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${e.images[0]}`:undefined,source:'free-db',sourceUrl:`https://github.com/yuhonas/free-exercise-db`,attribution:'Free Exercise DB / yuhonas. Dataset declares public domain (Unlicense).',license:'Unlicense — https://github.com/yuhonas/free-exercise-db/blob/main/LICENSE.md'}));
}
