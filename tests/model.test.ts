import {describe,it,expect} from 'vitest';
import {createSession,StateSchema,DateKey,addDays,rotationSchedule,uniqueSchedule,lastExercise,totalKg,volume,parseBackup,measurementCsv} from '../src/model';
import {initialState,METRICS} from '../src/data';
import {parseCsv,importMeasurementCsv} from '../src/services/backup';
import type {Routine,AppState} from '../src/model';

const routine:Routine={id:'upper',name:'Upper A',notes:'',color:'#fff',items:[{id:'bench-item',exerciseId:'bench',sets:[{weight:20,reps:8},{weight:20,reps:8}],weightMode:'perSide',unit:'kg',barWeight:20,restSec:90,notes:'Bench setup'}]};
const build=()=>createSession(routine,initialState().exercises,1000000);
const backup=(data:AppState)=>JSON.stringify({app:'Ironlog',format:1,exportedAt:new Date().toISOString(),data});

describe('routine defaults and session snapshots',()=>{
 it('starts with defaults; heavier session edits do not change future workouts',()=>{const s=build();s.exercises[0].sets[0].weight=25;s.exercises[0].sets[0].reps=6;expect(routine.items[0].sets[0]).toEqual({weight:20,reps:8});expect(build().exercises[0].sets[0].weight).toBe(20);});
 it('does not change history when a routine is edited later',()=>{const r=structuredClone(routine);const s=createSession(r,initialState().exercises);r.items[0].sets[0].weight=99;r.name='Changed';expect(s.routineName).toBe('Upper A');expect(s.exercises[0].sets[0].weight).toBe(20);});
 it('rejects an empty routine',()=>expect(()=>createSession({...routine,items:[]},[])).toThrow('Add an exercise'));
 it('finds the previous completed session, excluding active and future sessions',()=>{const old={...build(),status:'completed' as const,id:'old',startedAt:1};old.exercises[0].sets[0].done=true;const future={...old,id:'future',startedAt:10};expect(lastExercise([old,build(),future],'bench',5)?.session.id).toBe('old');});
 it('only uses sessions containing a checked set',()=>{expect(lastExercise([{...build(),status:'completed'}],'bench')).toBeUndefined();});
});
describe('weight semantics and progress',()=>{
 const i=routine.items[0];
 it('includes both sides and the bar',()=>expect(totalKg(20,i)).toBe(60));
 it('doubles dumbbells and converts pounds',()=>expect(totalKg(20,{...i,unit:'lb',weightMode:'perDumbbell'})).toBeCloseTo(18.1437,4));
 it('uses a single total for stack machines',()=>expect(totalKg(30,{...i,weightMode:'total'})).toBe(30));
 it('does not invent lifted loads for assisted/bodyweight movements',()=>{expect(totalKg(40,{...i,weightMode:'assisted'})).toBeNull();expect(totalKg(0,{...i,weightMode:'bodyweight'})).toBeNull();});
 it('counts only completed non-warmup work',()=>{const s=build();s.exercises[0].sets[0].done=true;expect(volume(s)).toBe(480);s.exercises[0].sets[0].warmup=true;expect(volume(s)).toBe(0);});
});
describe('calendar',()=>{
 it('validates real dates including leap years',()=>{expect(DateKey.safeParse('2026-02-30').success).toBe(false);expect(DateKey.safeParse('2028-02-29').success).toBe(true);expect(DateKey.safeParse('2026-13-01').success).toBe(false);});
 it('crosses month and year boundaries',()=>{expect(addDays('2026-12-31',1)).toBe('2027-01-01');expect(addDays('2026-03-28',2)).toBe('2026-03-30');});
 it('rotates routines with rest days',()=>{const rows=rotationSchedule('2026-11-17',['upper','lower','rest'],7);expect(rows.map(r=>r.date)).toEqual(['2026-11-17','2026-11-18','2026-11-20','2026-11-21','2026-11-23']);});
 it('merges matching calendar entries without removing different routines',()=>{expect(uniqueSchedule([{id:'a',date:'2026-11-17',routineId:'upper'},{id:'b',date:'2026-11-17',routineId:'upper'},{id:'c',date:'2026-11-17',routineId:'lower'}])).toHaveLength(2);});
});
describe('backup integrity',()=>{
 it('roundtrips routines, history, body readings and custom metrics',()=>{const state=initialState();state.routines=[routine];state.sessions=[build()];state.measurements=[{id:'m',date:'2026-11-17',notes:'device reading',values:{weight:84,bodyFat:20}}];state.customMetrics=[{key:'waist',label:'Waist',unit:'cm'}];expect(parseBackup(backup(state))).toEqual(state);});
 it('resets notifications belonging to another phone',()=>{const state=initialState();state.timer={endAt:999,remaining:60,notificationId:'foreign',label:'Bench'};expect(parseBackup(backup(state)).timer).toEqual(initialState().timer);});
 it('keeps embedded photos and removes nonportable file paths',()=>{const state=initialState();state.exercises[0].photo='file:///private/old-phone.jpg';state.exercises[1].photo='data:image/jpeg;base64,YQ==';const read=parseBackup(backup(state));expect(read.exercises[0].photo).toBeUndefined();expect(read.exercises[1].photo).toBe('data:image/jpeg;base64,YQ==');});
 it('rejects incompatible schemas without mutating state',()=>{const state=initialState();expect(()=>parseBackup(backup({...state,schemaVersion:2} as unknown as AppState))).toThrow();expect(state.schemaVersion).toBe(1);});
 it('rejects broken references',()=>{const state=initialState();state.schedule=[{id:'p',date:'2026-11-17',routineId:'missing'}];expect(()=>parseBackup(backup(state))).toThrow('references');});
 it('rejects multiple draft workouts',()=>{const state=initialState();state.sessions=[build(),build()];expect(()=>parseBackup(backup(state))).toThrow('multiple unfinished');});
});
describe('body reading CSV',()=>{
 it('roundtrips zero values, decimals, commas, quotes and multiline notes',()=>{const rows=[{id:'m',date:'2026-11-17',notes:'Before breakfast, "Boditrax"\nSame device',values:{weight:84.2,bodyFat:0}}];const raw=measurementCsv(rows,METRICS);const parsed=importMeasurementCsv(raw,METRICS);expect(parsed[0].values).toEqual(rows[0].values);expect(parsed[0].notes).toBe(rows[0].notes);});
 it('rejects invalid values and unknown fields',()=>{expect(()=>importMeasurementCsv('date,weight\n2026-11-17,nope',METRICS)).toThrow('Invalid');expect(()=>importMeasurementCsv('date,bodyFat\n2026-11-17,120',METRICS)).toThrow('allowed');expect(()=>importMeasurementCsv('date,unknown\n2026-11-17,10',METRICS)).toThrow('unknown');});
 it('rejects invalid dates and unmatched quotes',()=>{expect(()=>importMeasurementCsv('date,weight\n2026-02-30,80',METRICS)).toThrow();expect(()=>parseCsv('date,notes\n2026-11-17,"oops')).toThrow('unclosed');});
});
