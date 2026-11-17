import React, {createContext,useContext,useEffect,useRef,useState,ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, AppState as NativeAppState } from 'react-native';
import { AppState, StateSchema } from './model';
import { initialState } from './data';
import { cancelRest,scheduleRest } from './services/notifications';

export const STORAGE_KEY='ironlog.state.v1';
type Update=(fn:(state:AppState)=>AppState)=>void;
type Store={state:AppState;update:Update;ready:boolean;storageError:string;retrySave:()=>void;recover:(state:AppState)=>Promise<void>;startRest:(seconds:number,label?:string)=>Promise<void>;stopRest:()=>Promise<void>;pauseRest:()=>Promise<void>};
const Context=createContext<Store|null>(null);
export function StoreProvider({children}:{children:ReactNode}) {
  const [state,setState]=useState(initialState),[ready,setReady]=useState(false),[storageError,setError]=useState('');
  const [retry,setRetry]=useState(0);
  const ref=useRef(state), queue=useRef(Promise.resolve()),timerQueue=useRef(Promise.resolve());
  const update:Update=fn=>{const next=fn(ref.current);ref.current=next;setState(next);};
  useEffect(()=>{let alive=true;(async()=>{
    try { const raw=await AsyncStorage.getItem(STORAGE_KEY);if(raw){const parsed=StateSchema.parse(JSON.parse(raw));if(alive){ref.current=parsed;setState(parsed);}} }
    catch {if(alive)setError('Your saved data could not be loaded. Export recovery data or restore a backup before continuing. Existing data has not been overwritten.');return;}
    if(alive)setReady(true);
  })();return()=>{alive=false;};},[]);
  useEffect(()=>{if(!ready)return;const serialized=JSON.stringify(state);queue.current=queue.current.catch(()=>{}).then(async()=>{try{await AsyncStorage.setItem(STORAGE_KEY,serialized);setError('');}catch{setError('Changes could not be saved. Free some phone storage, then tap Retry. Keep the app open or export a backup.');}});},[state,ready,retry]);
  useEffect(()=>{const sub=NativeAppState.addEventListener('change',status=>{if(status==='background' && ready){queue.current=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(ref.current))).catch(()=>{setError('Unable to save your latest changes.');});}});return()=>sub.remove();},[ready]);
  function startRest(seconds:number,label='Rest') {
    timerQueue.current=timerQueue.current.catch(()=>{}).then(async()=>{
      await cancelRest(ref.current.timer.notificationId).catch(()=>{});
      const endAt=Date.now()+seconds*1000;
      update(s=>({...s,timer:{endAt,remaining:seconds,label,notificationId:null}}));
      try{const notificationId=await scheduleRest(seconds,label);update(s=>({...s,timer:{...s.timer,notificationId}}));}
      catch(e){Alert.alert('Rest timer',e instanceof Error?e.message:'Timer started, but an Android alert could not be scheduled.');}
    }); return timerQueue.current;
  }
  function stopRest(){timerQueue.current=timerQueue.current.catch(()=>{}).then(async()=>{await cancelRest(ref.current.timer.notificationId).catch(()=>{});update(s=>({...s,timer:{endAt:null,remaining:0,label:'Rest',notificationId:null}}));});return timerQueue.current;}
  function pauseRest(){timerQueue.current=timerQueue.current.catch(()=>{}).then(async()=>{const t=ref.current.timer;await cancelRest(t.notificationId).catch(()=>{});update(s=>({...s,timer:{...s.timer,endAt:null,remaining:Math.max(0,Math.ceil(((t.endAt??Date.now())-Date.now())/1000)),notificationId:null}}));});return timerQueue.current;}
  async function recover(data:AppState){await AsyncStorage.setItem(STORAGE_KEY,JSON.stringify(data));ref.current=data;setState(data);setError('');setReady(true);}
  return <Context.Provider value={{state,update,ready,storageError,retrySave:()=>setRetry(v=>v+1),recover,startRest,stopRest,pauseRest}}>{children}</Context.Provider>;
}
export function useStore(){const value=useContext(Context);if(!value)throw new Error('StoreProvider missing');return value;}
