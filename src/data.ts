import { AppState, Exercise, MetricDefinition } from './model';

export const METRICS: MetricDefinition[] = [
  {key:'weight',label:'Body weight',unit:'kg'}, {key:'bodyFat',label:'Body fat',unit:'%'},
  {key:'muscleMass',label:'Muscle mass',unit:'kg'}, {key:'fatMass',label:'Fat mass',unit:'kg'},
  {key:'fatFreeMass',label:'Fat-free mass',unit:'kg'}, {key:'water',label:'Total body water',unit:'%'},
  {key:'waterKg',label:'Total body water mass',unit:'kg'}, {key:'visceralFat',label:'Visceral fat rating',unit:'rating'},
  {key:'boneMass',label:'Bone mass',unit:'kg'}, {key:'bmr',label:'Basal metabolic rate',unit:'kcal/day'},
  {key:'metabolicAge',label:'Metabolic age',unit:'years'}, {key:'bmi',label:'BMI (reported)',unit:'kg/m²'},
  {key:'physiqueRating',label:'Physique rating',unit:'rating'}, {key:'phaseAngle',label:'Phase angle',unit:'°'},
  ...['Left arm','Right arm','Left leg','Right leg','Trunk'].flatMap(label => [
    {key:label.replaceAll(' ','').toLowerCase()+'Muscle',label:`${label} · muscle mass`,unit:'kg'},
    {key:label.replaceAll(' ','').toLowerCase()+'Fat',label:`${label} · body fat`,unit:'%'},
  ]),
];

const builtIn = (id: string,name: string,muscles: string[],equipment: string,secondaryMuscles: string[] = []): Exercise => ({
  id, name, muscles, secondaryMuscles, equipment, source:'built-in', instructions:'',
  attribution:'Ironlog starter catalogue: editable organisational labels. Use the online library for sourced exercise instructions.',
});
export const STARTER_EXERCISES = [
  builtIn('bench','Barbell bench press',['Chest'],'Barbell and flat bench',['Triceps','Shoulders']),
  builtIn('incline','Incline Smith press',['Chest'],'Smith machine and incline bench',['Triceps','Shoulders']),
  builtIn('pulldown','Lat pulldown',['Lats'],'Lat pulldown machine',['Biceps']),
  builtIn('row','Seated cable row',['Middle back'],'Cable row machine',['Biceps','Lats']),
  builtIn('shoulder','Dumbbell shoulder press',['Shoulders'],'Dumbbells and bench',['Triceps']),
  builtIn('curl','Dumbbell curl',['Biceps'],'Dumbbells',['Forearms']),
  builtIn('triceps','Cable triceps pushdown',['Triceps'],'Cable machine'),
  builtIn('squat','Barbell back squat',['Quadriceps'],'Barbell and rack',['Glutes']),
  builtIn('legpress','Leg press',['Quadriceps'],'Leg press machine',['Glutes']),
  builtIn('legcurl','Seated leg curl',['Hamstrings'],'Seated leg curl machine'),
  builtIn('rdl','Romanian deadlift',['Hamstrings'],'Barbell',['Glutes','Lower back']),
  builtIn('calf','Calf raise',['Calves'],'Calf raise machine'),
];
export function initialState(): AppState {
  return { schemaVersion:1, exercises:STARTER_EXERCISES, routines:[], sessions:[], schedule:[], measurements:[], customMetrics:[],
    profile:{name:'',birthDate:'',heightCm:'',goalWeightKg:'',sex:'',notes:''},
    settings:{unit:'kg',autoRest:true,defaultRest:90,weeklyGoal:4}, timer:{endAt:null,remaining:0,label:'Rest',notificationId:null} };
}
