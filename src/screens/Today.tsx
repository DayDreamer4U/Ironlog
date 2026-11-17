import React from 'react';
import { View,Text } from 'react-native';
import { ArrowUpRight,Flame,CalendarDays,Play } from 'lucide-react-native';
import { useStore } from '../store';
import { Routine,dateKey,dateLabel,addDays } from '../model';
import { C,s,Screen,Button,Empty } from '../components/ui';
import { Timer } from '../components/Timer';

export function Today({onStart,onSession,onRoutines,onCalendar}:{onStart:(r:Routine)=>void;onSession:(id:string)=>void;onRoutines:()=>void;onCalendar:()=>void}){
  const {state}=useStore();const today=dateKey(),completed=state.sessions.filter(s=>s.status==='completed'),draft=state.sessions.find(s=>s.status==='draft');
  const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));const monday=dateKey(d);const week=completed.filter(s=>s.date>=monday&&s.date<=addDays(monday,6)).length;
  const scheduled=state.schedule.filter(p=>p.date===today).map(p=>state.routines.find(r=>r.id===p.routineId)).filter((r):r is Routine=>!!r);
  return <Screen title={state.profile.name?`Let’s go, ${state.profile.name.split(' ')[0]}.`:'Make progress.'} subtitle="IRONLOG / YOUR TRAINING" action={<Timer compact/>}>
    <View style={[s.card,{backgroundColor:'#D9FA68',borderColor:C.lime,padding:24,gap:20}]}><View style={s.between}><Text style={[s.eyebrow,{color:'#46551B'}]}>{dateLabel(today).toUpperCase()}</Text><ArrowUpRight color={C.bg} size={24}/></View><Text style={[s.title,{color:C.bg,fontSize:35}]}>{draft?'Pick up where\nyou left off.':scheduled.length?'Your next\nstronger session.':'Your plan.\nYour pace.'}</Text><Text style={{fontSize:14,color:'#39431D'}}>{draft?draft.routineName:scheduled.length?scheduled.map(r=>r.name).join(' + '):'Start a routine or plan your next workout.'}</Text><Button title={draft?'Resume workout':scheduled.length?`Start ${scheduled[0].name}`:'Choose a routine'} secondary style={{backgroundColor:C.bg,alignSelf:'flex-start'}} icon={<Play size={16} color={C.lime}/>} onPress={()=>draft?onSession(draft.id):scheduled.length?onStart(scheduled[0]):onRoutines()}/></View>
    <View style={s.row}><View style={[s.card,{flex:1}]}><Text style={s.muted}>This week</Text><Text style={s.title}>{week}<Text style={[s.h3,{color:C.muted}]}> / {state.settings.weeklyGoal}</Text></Text><Text style={s.muted}>workouts completed</Text></View><View style={[s.card,{flex:1}]}><Text style={s.muted}>Your journey</Text><Text style={s.title}>{completed.length}</Text><Text style={s.muted}>sessions recorded</Text></View></View>
    <View style={s.between}><Text style={s.h2}>Today’s plan</Text><Button title="Calendar" secondary onPress={onCalendar}/></View>
    {scheduled.length?scheduled.map(r=>{const done=completed.some(s=>s.date===today&&s.routineId===r.id);return <View key={r.id} style={s.card}><View style={s.between}><View style={{flex:1}}><Text style={s.h3}>{r.name}</Text><Text style={s.muted}>{r.items.length} exercises · {done?'Completed today':'Ready when you are'}</Text></View><Button title={done?'Train again':'Start'} secondary={done} onPress={()=>onStart(r)}/></View></View>;}):<View style={s.card}><Text style={s.muted}>No routine scheduled today. Rest, start an unscheduled workout, or add a plan.</Text><Button title="Plan a session" secondary onPress={onCalendar}/></View>}
    <Text style={s.h2}>Recent activity</Text>{completed.length?completed.slice().sort((a,b)=>b.startedAt-a.startedAt).slice(0,3).map(v=><View key={v.id} style={[s.card,s.between]}><View style={{flex:1}}><Text style={s.h3}>{v.routineName}</Text><Text style={s.muted}>{dateLabel(v.date)} · {v.exercises.flatMap(e=>e.sets).filter(s=>s.done).length} completed sets</Text></View><Button title="View" secondary onPress={()=>onSession(v.id)}/></View>):<Text style={s.muted}>Your completed workouts will appear here.</Text>}
  </Screen>;
}
