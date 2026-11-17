import React,{useState} from 'react';
import { View,Text,Alert } from 'react-native';
import { useStore } from '../store';
import { dateLabel,volume,totalKg,loadLabel } from '../model';
import { C,s,Screen,Button,Chips,Empty } from '../components/ui';
import { Chart } from '../components/Chart';

export function Progress({onSession}:{onSession:(id:string)=>void}){
  const {state,update}=useStore();const [exercise,setExercise]=useState(''),[range,setRange]=useState<'30'|'90'|'all'>('90');
  const sessions=state.sessions.filter(v=>v.status==='completed').sort((a,b)=>a.startedAt-b.startedAt);
  const selected=exercise||sessions.at(-1)?.exercises[0]?.exerciseId||'';
  const exerciseIds=[...new Set(sessions.flatMap(v=>v.exercises.map(e=>e.exerciseId)))];
  const cutoff=range==='all'?0:Date.now()-Number(range)*86400000;
  const filtered=sessions.filter(s=>s.startedAt>=cutoff);
  const points=filtered.flatMap(session=>session.exercises.filter(e=>e.exerciseId===selected).flatMap(e=>{const weights=e.sets.filter(s=>s.done&&!s.warmup).map(s=>totalKg(s.weight,e)).filter((v):v is number=>v!==null);return weights.length?[{label:session.date.slice(5),value:Math.max(...weights)}]:[];}));
  const setCount=filtered.flatMap(v=>v.exercises.flatMap(e=>e.sets)).filter(s=>s.done&&!s.warmup).length;
  return <Screen title="Your progress" subtitle="SMALL STEPS. REAL RECORDS.">
    <Chips options={[{value:'30',label:'30 days'},{value:'90',label:'90 days'},{value:'all',label:'All time'}]} value={range} onChange={setRange}/>
    <View style={s.row}><View style={[s.card,{flex:1}]}><Text style={s.muted}>Sessions</Text><Text style={s.title}>{filtered.length}</Text></View><View style={[s.card,{flex:1}]}><Text style={s.muted}>Working sets</Text><Text style={s.title}>{setCount}</Text></View></View>
    <View style={s.card}><Text style={s.h2}>Workout volume</Text><Text style={s.muted}>Completed working sets × reps × total external load, normalised to kg. Warmups, bodyweight and assisted movements are excluded.</Text><Chart points={filtered.map(v=>({label:v.date.slice(5),value:volume(v)}))} unit="kg·reps"/></View>
    {!!exerciseIds.length&&<View style={s.card}><Text style={s.h2}>Exercise strength trend</Text><Chips options={exerciseIds.map(id=>({value:id,label:state.exercises.find(e=>e.id===id)?.name||sessions.flatMap(s=>s.exercises).find(e=>e.exerciseId===id)?.name||id}))} value={selected} onChange={setExercise}/><Text style={s.muted}>Heaviest completed working-set total load per session, in kg. Bodyweight and assistance do not have a comparable total and are omitted.</Text><Chart points={points} unit="kg" color={C.purple}/>{points.length>0&&<Text style={s.h3}>Best total external load: {Math.max(...points.map(p=>p.value)).toFixed(1)} kg</Text>}</View>}
    <Text style={s.h2}>Workout history</Text>{!filtered.length&&<Empty title="Your history starts here" detail="Finish a workout to see your sessions, sets and weight trends."/>}
    {[...filtered].reverse().map(v=><View key={v.id} style={s.card}><View style={s.between}><Text style={[s.h3,{flex:1}]}>{v.routineName}</Text><Text style={s.muted}>{dateLabel(v.date)}</Text></View><Text style={s.muted}>{v.exercises.flatMap(e=>e.sets).filter(s=>s.done).length} completed sets · {Math.round(volume(v)).toLocaleString()} kg·reps</Text><View style={s.row}><Button title="View workout" secondary onPress={()=>onSession(v.id)}/><Button title="Delete" danger onPress={()=>Alert.alert('Delete session?','This workout record will be permanently removed.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>update(st=>({...st,sessions:st.sessions.filter(s=>s.id!==v.id)}))}])}/></View></View>)}
  </Screen>;
}
