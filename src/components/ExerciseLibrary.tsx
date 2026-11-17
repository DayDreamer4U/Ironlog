import React,{useState} from 'react';
import { View,Text,Image,Alert,ActivityIndicator,Linking } from 'react-native';
import { Search,Plus,Download,Camera } from 'lucide-react-native';
import { Exercise,uid } from '../model';
import { useStore } from '../store';
import { downloadFreeDb,downloadWger,searchNinjas } from '../services/catalogue';
import { readApiKey } from '../services/credentials';
import { pickPhoto } from '../services/files';
import { C,s,Button,Field,Sheet,Chips,Empty } from './ui';

export function ExerciseLibrary({visible,onClose,onSelect}:{visible:boolean;onClose:()=>void;onSelect?:(exercise:Exercise)=>void}){
  const {state,update}=useStore();const [query,setQuery]=useState(''),[muscle,setMuscle]=useState(''),[equipment,setEquipment]=useState('');
  const [busy,setBusy]=useState(''),[remote,setRemote]=useState<Exercise[]>([]),[detail,setDetail]=useState<Exercise|null>(null),[edit,setEdit]=useState<Exercise|null>(null),[limit,setLimit]=useState(40);
  const merge=(rows:Exercise[])=>update(st=>{const map=new Map(st.exercises.map(e=>[e.id,e]));rows.forEach(e=>{if(!map.has(e.id))map.set(e.id,e);});return {...st,exercises:[...map.values()]};});
  async function download(kind:'wger'|'free-db') {setBusy('Downloading exercise library…');try{const rows=kind==='wger'?await downloadWger(n=>setBusy(`Downloaded ${n} exercise descriptions…`)):await downloadFreeDb();merge(rows);Alert.alert('Library ready',`${rows.length} exercises are available on this phone. Text is saved offline. Online pictures need a connection.`);}catch(e){Alert.alert('Could not download',String(e instanceof Error?e.message:e));}finally{setBusy('');}}
  async function searchApi(){if(query.trim().length<2)return;setBusy('Searching API Ninjas…');try{setRemote(await searchNinjas(query.trim(),await readApiKey()||''));}catch(e){Alert.alert('Search unavailable',String(e instanceof Error?e.message:e));}finally{setBusy('');}}
  const rows=[...remote,...state.exercises.filter(e=>!remote.some(r=>r.id===e.id))].filter(e=>`${e.name} ${e.muscles.join(' ')} ${e.equipment}`.toLowerCase().includes(query.toLowerCase())&&e.muscles.concat(e.secondaryMuscles).join(' ').toLowerCase().includes(muscle.toLowerCase())&&e.equipment.toLowerCase().includes(equipment.toLowerCase()));
  const choose=(e:Exercise)=>{merge([e]);setDetail(null);onSelect?.(e);onClose();};
  return <><Sheet visible={visible} title="Exercise library" onClose={onClose}>
    <Field label="Search exercises" value={query} onChange={v=>{setQuery(v);setLimit(40);}} placeholder="Bench press, cable, hamstrings…"/>
    <View style={s.row}><View style={{flex:1}}><Field label="Muscle filter" value={muscle} onChange={setMuscle} placeholder="e.g. chest"/></View><View style={{flex:1}}><Field label="Equipment filter" value={equipment} onChange={setEquipment} placeholder="e.g. machine"/></View></View>
    <Button title="Create custom exercise" secondary icon={<Plus color={C.text} size={18}/>} onPress={()=>setEdit({id:uid('custom'),name:'',muscles:[],secondaryMuscles:[],equipment:'',instructions:'',source:'custom'})}/>
    <View style={s.card}><Text style={s.h3}>Free exercise sources</Text><Text style={s.muted}>Download a library once for offline search. API Ninjas requires your own free key in Settings. Only exercise search terms are sent, never your workout or body records.</Text>
      <View style={[s.row,{flexWrap:'wrap'}]}><Button title="Download wger" secondary disabled={!!busy} onPress={()=>void download('wger')}/><Button title="Free Exercise DB" secondary disabled={!!busy} onPress={()=>void download('free-db')}/></View>
      <Button title="Search API Ninjas" secondary disabled={!!busy||query.trim().length<2} icon={<Search color={C.text} size={16}/>} onPress={()=>void searchApi()}/>{busy&&<View style={s.row}><ActivityIndicator color={C.lime}/><Text style={[s.muted,{flex:1}]}>{busy}</Text></View>}
    </View><Text style={s.eyebrow}>{rows.length} RESULTS · {state.exercises.length} SAVED</Text>
    {rows.slice(0,limit).map(e=><View key={e.id} style={s.card}><Text style={s.h3}>{e.name}</Text><Text style={s.muted}>{e.muscles.join(' · ')||'Muscles not specified'}{e.secondaryMuscles.length?` / ${e.secondaryMuscles.join(' · ')}`:''}</Text><Text style={s.text}>{e.equipment||'Equipment not specified'}</Text><View style={s.between}><Text style={s.muted}>{e.source}</Text><View style={s.row}><Button title="Details" secondary onPress={()=>setDetail(e)}/>{onSelect&&<Button title="Add" onPress={()=>choose(e)}/>}</View></View></View>)}
    {rows.length>limit&&<Button title="Show more" secondary onPress={()=>setLimit(v=>v+40)}/>}{!rows.length&&<Empty title="No matching exercises" detail="Change the filters, search an API, or create your own exercise."/>}
  </Sheet>
  <Sheet visible={!!detail} title={detail?.name||'Exercise'} onClose={()=>setDetail(null)}>{detail&&<>
    {(detail.photo||detail.image)&&<Image source={{uri:detail.photo||detail.image}} resizeMode="contain" style={{height:230,borderRadius:16,backgroundColor:C.input}}/>}
    <Text style={s.eyebrow}>PRIMARY MUSCLES</Text><Text style={s.text}>{detail.muscles.join(', ')||'Not specified'}</Text><Text style={s.eyebrow}>SECONDARY MUSCLES</Text><Text style={s.text}>{detail.secondaryMuscles.join(', ')||'Not specified'}</Text><Text style={s.eyebrow}>EQUIPMENT / MACHINE</Text><Text style={s.text}>{detail.equipment||'Not specified'}</Text><Text style={s.text}>{detail.instructions||'No instructions saved. Add your own notes or download a sourced exercise.'}</Text>
    <Button title="Edit / add machine photo" secondary onPress={()=>setEdit(detail)}/>{onSelect&&<Button title="Add to routine" onPress={()=>choose(detail)}/>}
    <Text style={s.muted}>{detail.attribution}</Text><Text style={s.muted}>{detail.license}</Text>{detail.sourceUrl&&<Button title="View source" secondary onPress={()=>void Linking.openURL(detail.sourceUrl!)}/>}
  </>}</Sheet>
  <Sheet visible={!!edit} title="Exercise details" onClose={()=>setEdit(null)}>{edit&&<>
    <Field label="Exercise name" value={edit.name} onChange={name=>setEdit({...edit,name})}/><Field label="Primary muscles (comma separated)" value={edit.muscles.join(',')} onChange={v=>setEdit({...edit,muscles:v.split(',')})}/><Field label="Secondary muscles (comma separated)" value={edit.secondaryMuscles.join(',')} onChange={v=>setEdit({...edit,secondaryMuscles:v.split(',')})}/><Field label="Equipment / your machine name" value={edit.equipment} onChange={equipment=>setEdit({...edit,equipment})}/><Field label="Instructions / setup" value={edit.instructions} onChange={instructions=>setEdit({...edit,instructions})} multiline/>
    <Button title="Choose machine photo" secondary icon={<Camera color={C.text} size={18}/>} onPress={()=>void(async()=>{try{const photo=await pickPhoto();if(photo)setEdit({...edit,photo});}catch(e){Alert.alert('Photo unavailable',String(e));}})()}/>{edit.photo&&<Image source={{uri:edit.photo}} style={{height:180,borderRadius:16}} resizeMode="contain"/>}
    <Button title="Save exercise" disabled={!edit.name.trim()} onPress={()=>{const saved={...edit,name:edit.name.trim(),muscles:edit.muscles.map(s=>s.trim()).filter(Boolean),secondaryMuscles:edit.secondaryMuscles.map(s=>s.trim()).filter(Boolean)};update(st=>({...st,exercises:[...st.exercises.filter(e=>e.id!==saved.id),saved]}));setEdit(null);setDetail(saved);}}/>
  </>}</Sheet></>;
}
