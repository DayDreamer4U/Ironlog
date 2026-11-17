// @vitest-environment jsdom
import React from 'react';
import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react';
import App from '../App';
import {initialState} from '../src/data';
import {STORAGE_KEY} from '../src/store';

vi.mock('lucide-react-native',async()=>{const r=await import('react');return Object.fromEntries(['House','Dumbbell','CalendarDays','ChartNoAxesCombined','UserRound','X','Plus','ArrowLeft','Pause','Play','Timer','ArrowUpRight','Flame','Copy','ArrowUp','ArrowDown','Trash2','BookOpen','Search','Download','Camera','Check','Square','CheckSquare','ChevronDown','ChevronUp','ChevronLeft','ChevronRight','Settings'].map(name=>[name,()=>r.createElement('span',{'aria-hidden':true})]));});
vi.mock('react-native-svg',async()=>{const r=await import('react');return {default:({children}:any)=>r.createElement('svg',null,children),Path:()=>null,Circle:()=>null,Line:()=>null,Text:()=>null};});
vi.mock('@react-native-async-storage/async-storage',()=>({default:{getItem:async(key:string)=>localStorage.getItem(key),setItem:async(key:string,value:string)=>{localStorage.setItem(key,value);}}}));
vi.mock('expo-status-bar',()=>({StatusBar:()=>null}));
vi.mock('react-native-safe-area-context',async()=>{const r=await import('react');return {SafeAreaProvider:({children}:any)=>r.createElement('div',null,children),SafeAreaView:({children}:any)=>r.createElement('div',null,children)};});
beforeEach(()=>{localStorage.clear();const state=initialState();state.settings.autoRest=false;localStorage.setItem(STORAGE_KEY,JSON.stringify(state));vi.spyOn(window,'confirm').mockReturnValue(true);vi.spyOn(window,'alert').mockImplementation(()=>{});});
afterEach(()=>{cleanup();vi.restoreAllMocks();});
const click=(name:string)=>fireEvent.click(screen.getByRole('button',{name,exact:true}));
async function boot(){render(<App/>);await screen.findByText('Make progress.');}
async function routine(){fireEvent.click(screen.getByRole('tab',{name:'Routines'}));click('Create routine');fireEvent.change(screen.getByLabelText('Routine name'),{target:{value:'Upper Test'}});click('Add exercise');fireEvent.change(screen.getByLabelText('Search exercises'),{target:{value:'Barbell bench'}});click('Add');await screen.findByLabelText('Default weight set 1');fireEvent.change(screen.getByLabelText('Default weight set 1'),{target:{value:'20'}});fireEvent.blur(screen.getByLabelText('Default weight set 1'));click('Done');click('Save routine');await screen.findByText('Upper Test');}

describe('app flows',()=>{
 it('creates a routine, logs a heavier set, and starts the next session with original defaults',async()=>{await boot();await routine();click('Start');const weight=await screen.findByLabelText('Weight Barbell bench press set 1');expect((weight as HTMLInputElement).value).toBe('20');fireEvent.change(weight,{target:{value:'25'}});fireEvent.blur(weight);click('Complete Barbell bench press set 1');click('Finish workout');await waitFor(()=>expect(screen.queryByLabelText('Weight Barbell bench press set 1')).toBeNull());click('Start');const next=await screen.findByLabelText('Weight Barbell bench press set 1');expect((next as HTMLInputElement).value).toBe('20');expect(screen.getByText(/Last session.*25 kg/)).toBeTruthy();});
 it('saves personal details and a body composition reading',async()=>{await boot();fireEvent.click(screen.getByRole('tab',{name:'You'}));click('Edit');fireEvent.change(screen.getByLabelText('Name'),{target:{value:'Test Athlete'}});fireEvent.change(screen.getByLabelText('Height (cm)'),{target:{value:'175'}});click('Save profile');await screen.findByText('Test Athlete');click('Add body / Boditrax reading');fireEvent.change(screen.getByLabelText('Body weight (kg)'),{target:{value:'84.2'}});fireEvent.change(screen.getByLabelText('Body fat (%)'),{target:{value:'21'}});fireEvent.change(screen.getByLabelText('Muscle mass (kg)'),{target:{value:'62'}});click('Save reading');await waitFor(()=>{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)!);expect(saved.measurements[0].values).toEqual({weight:84.2,bodyFat:21,muscleMass:62});expect(saved.profile.heightCm).toBe('175');});});
 it('adds a routine to the calendar and preserves it after reload',async()=>{await boot();await routine();fireEvent.click(screen.getByRole('tab',{name:'Calendar'}));click('Schedule workout');click('Upper Test');click('Save schedule');await waitFor(()=>expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).schedule).toHaveLength(1));cleanup();render(<App/>);await screen.findByText('Make progress.');expect(screen.getAllByText('Upper Test').length).toBeGreaterThan(0);});
});
