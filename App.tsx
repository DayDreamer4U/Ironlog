import React,{useState} from 'react';
import { View,Text,Pressable,Alert,Platform,ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider,SafeAreaView } from 'react-native-safe-area-context';
import { House,Dumbbell,CalendarDays,ChartNoAxesCombined,UserRound } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreProvider,useStore,STORAGE_KEY } from './src/store';
import { Routine,createSession,parseBackup } from './src/model';
import { Today } from './src/screens/Today';
import { Routines } from './src/screens/Routines';
import { Calendar } from './src/screens/Calendar';
import { Progress } from './src/screens/Progress';
import { Profile } from './src/screens/Profile';
import { Workout } from './src/screens/Workout';
import { C,s,Button } from './src/components/ui';
import { exportText,importText } from './src/services/files';
import { cancelAllRest } from './src/services/notifications';

// The browser preview uses browser dialogs; Android uses native Alert.
if(Platform.OS==='web'){
  Alert.alert=(title,message,buttons)=>{
    if(buttons?.length){const action=buttons.filter(b=>b.style!=='cancel').at(-1);if(window.confirm([title,message].filter(Boolean).join('\n\n')))action?.onPress?.();}
    else window.alert([title,message].filter(Boolean).join('\n\n'));
  };
}
const tabs=[{id:'today',label:'Today',icon:House},{id:'routines',label:'Routines',icon:Dumbbell},{id:'calendar',label:'Calendar',icon:CalendarDays},{id:'progress',label:'Progress',icon:ChartNoAxesCombined},{id:'profile',label:'You',icon:UserRound}] as const;
type Tab=typeof tabs[number]['id'];
function AppContent(){
  const {state,update,ready,storageError,retrySave,recover}=useStore();const [tab,setTab]=useState<Tab>('today'),[session,setSession]=useState<string|null>(null);
  function start(routine:Routine){const draft=state.sessions.find(s=>s.status==='draft');if(draft){setSession(draft.id);return;}try{const workout=createSession(routine,state.exercises);update(st=>({...st,sessions:[...st.sessions,workout]}));setSession(workout.id);}catch(e){Alert.alert('Cannot start workout',e instanceof Error?e.message:String(e));}}
  if(!ready)return <SafeAreaView style={[s.page,{padding:24,justifyContent:'center',gap:20}]}><Text style={s.title}>IRONLOG<Text style={{color:C.lime}}> /</Text></Text>{storageError?<><Text style={s.text}>{storageError}</Text><Button title="Export original recovery file" onPress={()=>void(async()=>{try{await exportText('ironlog-recovery.json',await AsyncStorage.getItem(STORAGE_KEY)||'');}catch(e){Alert.alert('Export failed',String(e));}})()}/><Button title="Restore a valid backup" secondary onPress={()=>void(async()=>{try{const raw=await importText();if(!raw)return;const data=parseBackup(raw);Alert.alert('Restore backup?','The existing unreadable data will be replaced. Export the recovery file first.',[{text:'Cancel',style:'cancel'},{text:'Restore',onPress:()=>void(async()=>{try{await cancelAllRest();await recover(data);}catch(e){Alert.alert('Restore failed',String(e));}})()}]);}catch(e){Alert.alert('Invalid backup',String(e));}})()}/></>:<ActivityIndicator size="large" color={C.lime}/>}</SafeAreaView>;
  return <SafeAreaView style={s.page} edges={['top','left','right']}><StatusBar style="light"/>{storageError&&<View style={{backgroundColor:'#4B2933',padding:12,gap:8}}><Text style={s.text}>{storageError}</Text><Button title="Retry save" secondary onPress={retrySave}/></View>}
    <View style={{flex:1}}>{tab==='today'?<Today onStart={start} onSession={setSession} onRoutines={()=>setTab('routines')} onCalendar={()=>setTab('calendar')}/>:tab==='routines'?<Routines onStart={start}/>:tab==='calendar'?<Calendar onStart={start} onSession={setSession}/>:tab==='progress'?<Progress onSession={setSession}/>:<Profile/>}</View>
    <SafeAreaView edges={['bottom']} style={{backgroundColor:C.bg,borderTopWidth:1,borderTopColor:C.line}}><View style={{flexDirection:'row',paddingTop:8,paddingBottom:7}}>{tabs.map(t=>{const Icon=t.icon,active=tab===t.id;return <Pressable accessibilityRole="tab" accessibilityState={{selected:active}} accessibilityLabel={t.label} key={t.id} onPress={()=>setTab(t.id)} style={{flex:1,alignItems:'center',gap:5,paddingVertical:7}}><Icon color={active?C.lime:C.muted} size={22} strokeWidth={active?2.5:1.8}/><Text style={{color:active?C.lime:C.muted,fontSize:10,fontWeight:'600'}}>{t.label}</Text></Pressable>;})}</View></SafeAreaView>
    <Workout sessionId={session} onClose={()=>setSession(null)}/>
  </SafeAreaView>;
}
class ErrorBoundary extends React.Component<{children:React.ReactNode},{error:string}>{
  state={error:''};static getDerivedStateFromError(error:Error){return {error:error.message};}
  render(){return this.state.error?<SafeAreaView style={[s.page,{padding:24,justifyContent:'center',gap:16}]}><Text style={s.title}>Unable to display this screen</Text><Text style={s.text}>{this.state.error}</Text><Text style={s.muted}>Your saved data has not been deleted. Restart the app; restore your backup if the issue persists.</Text><Button title="Try again" onPress={()=>this.setState({error:''})}/></SafeAreaView>:this.props.children;}
}
export default function App(){return <SafeAreaProvider><ErrorBoundary><StoreProvider><AppContent/></StoreProvider></ErrorBoundary></SafeAreaProvider>;}
