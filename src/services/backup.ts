import { AppState,Measurement,MetricDefinition,DateKey,uid } from '../model';
import { portablePhoto,exportText } from './files';

export async function exportBackup(state:AppState) {
  const exercises=await Promise.all(state.exercises.map(async e=>({...e,photo:e.photo?await portablePhoto(e.photo):undefined})));
  const raw=JSON.stringify({app:'Ironlog',format:1,exportedAt:new Date().toISOString(),data:{...state,exercises,timer:{endAt:null,remaining:0,label:'Rest',notificationId:null}}},null,2);
  if(raw.length>50_000_000)throw new Error('Backup exceeds 50 MB. Remove large exercise photos and retry.');
  await exportText(`ironlog-backup-${new Date().toISOString().slice(0,10)}.json`,raw);
}
export function parseCsv(raw:string):string[][] {
  const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
  for(let i=0;i<raw.length;i++){const c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field='';}else field+=c;}
  if(quoted)throw new Error('CSV has an unclosed quoted value.');if(field||row.length){row.push(field.replace(/\r$/,''));rows.push(row);}return rows.filter(r=>r.some(v=>v.trim()));
}
export function importMeasurementCsv(raw:string,metrics:MetricDefinition[]):Measurement[]{
  const [headers,...rows]=parseCsv(raw.replace(/^\uFEFF/,''));if(!headers||headers[0]!=='date')throw new Error('Use the Ironlog CSV format with date as the first column. Export a CSV for a template.');
  const allowed=new Set(metrics.map(m=>m.key));if(headers.some(h=>h!=='date'&&h!=='notes'&&!allowed.has(h)))throw new Error('CSV contains unknown metrics. Add matching custom fields first.');
  if(rows.length>10000)throw new Error('Import at most 10,000 readings at a time.');
  return rows.map((row,index)=>{if(row.length!==headers.length)throw new Error(`CSV row ${index+2} has the wrong number of columns.`);const date=DateKey.parse(row[0]),values:Record<string,number>={};let notes='';for(let i=1;i<headers.length;i++){if(headers[i]==='notes'){notes=row[i];continue;}if(row[i].trim()==='')continue;const n=Number(row[i]);if(!Number.isFinite(n)||n<0||n>100000)throw new Error(`Invalid measurement in row ${index+2}.`);if(!validMetricValue(metrics.find(m=>m.key===headers[i])!,n))throw new Error(`Value outside the allowed range in row ${index+2}.`);values[headers[i]]=n;}if(!Object.keys(values).length)throw new Error(`Row ${index+2} has no measurements.`);return {id:uid('body'),date,values,notes};});
}
export function validMetricValue(metric:MetricDefinition,value:number){return Number.isFinite(value)&&value>=0&&value<=100000&&(metric.unit!=='%'||value<=100);}
