import { z } from 'zod';

const id = z.string().min(1).max(200);
const text = z.string().max(10000);
const number = z.number().finite().nonnegative().max(100000);
const timestamp = z.number().finite().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const DateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v => {
  const d = new Date(`${v}T12:00:00`);
  return !Number.isNaN(d.valueOf()) && `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` === v;
}, 'Use a valid YYYY-MM-DD date');
export const WeightMode = z.enum(['total', 'perSide', 'perDumbbell', 'bodyweight', 'assisted']);
export type WeightMode = z.infer<typeof WeightMode>;
export const Unit = z.enum(['kg', 'lb']);
export const ExerciseSchema = z.object({
  id, name: text.min(1), muscles: z.array(text), secondaryMuscles: z.array(text),
  equipment: text, instructions: text, image: text.optional(), photo: text.optional(),
  source: z.enum(['built-in', 'custom', 'wger', 'ninjas', 'free-db']),
  sourceUrl: text.optional(), attribution: text.optional(), license: text.optional(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;
export const SetSchema = z.object({ id, reps: number.int(), weight: number, done: z.boolean(), warmup: z.boolean().default(false) });
export type WorkoutSet = z.infer<typeof SetSchema>;
export const ItemSchema = z.object({
  id, exerciseId: id, sets: z.array(z.object({ reps: number.int(), weight: number })).min(1).max(100),
  weightMode: WeightMode, unit: Unit, barWeight: number, restSec: number.int().max(3600), notes: text,
});
export type RoutineItem = z.infer<typeof ItemSchema>;
export const RoutineSchema = z.object({ id, name: text.min(1), color: text, notes: text, items: z.array(ItemSchema).max(100) });
export type Routine = z.infer<typeof RoutineSchema>;
export const SessionItemSchema = ItemSchema.omit({ sets: true }).extend({
  name: text, muscles: z.array(text), equipment: text, sets: z.array(SetSchema).min(1).max(100),
});
export type SessionItem = z.infer<typeof SessionItemSchema>;
export const SessionSchema = z.object({
  id, routineId: id, routineName: text, date: DateKey, startedAt: timestamp,
  finishedAt: timestamp.optional(), status: z.enum(['draft', 'completed']),
  notes: text, exercises: z.array(SessionItemSchema),
});
export type Session = z.infer<typeof SessionSchema>;
export const ScheduleSchema = z.object({ id, date: DateKey, routineId: id });
export type Schedule = z.infer<typeof ScheduleSchema>;
export const MetricDefinitionSchema = z.object({ key: id, label: text.min(1), unit: text });
export type MetricDefinition = z.infer<typeof MetricDefinitionSchema>;
export const MeasurementSchema = z.object({ id, date: DateKey, values: z.record(z.string(), number), notes: text });
export type Measurement = z.infer<typeof MeasurementSchema>;
export const StateSchema = z.object({
  schemaVersion: z.literal(1), exercises: z.array(ExerciseSchema).max(10000),
  routines: z.array(RoutineSchema).max(1000), sessions: z.array(SessionSchema).max(30000),
  schedule: z.array(ScheduleSchema).max(50000), measurements: z.array(MeasurementSchema).max(30000),
  customMetrics: z.array(MetricDefinitionSchema).max(100),
  profile: z.object({ name: text, birthDate: z.string(), heightCm: z.string(), goalWeightKg: z.string(), sex: text, notes: text }),
  settings: z.object({ unit: Unit, autoRest: z.boolean(), defaultRest: number.int().max(3600), weeklyGoal: number.int().min(1).max(14) }),
  timer: z.object({ endAt: timestamp.nullable(), remaining: number, label: text, notificationId: text.nullable() }),
});
export type AppState = z.infer<typeof StateSchema>;
export const BackupSchema = z.object({ app: z.literal('Ironlog'), format: z.literal(1), exportedAt: z.string(), data: StateSchema });
export function uid(prefix = 'id') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`; }
export function dateKey(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function addDays(date: string, days: number) { const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return dateKey(d); }
export function dateLabel(date: string) { return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' }); }
export const MODE_LABEL: Record<WeightMode,string> = { total: 'total', perSide: 'per side', perDumbbell: 'per dumbbell', bodyweight: 'added load', assisted: 'assistance' };
export function loadLabel(item: Pick<RoutineItem,'weightMode'|'unit'>) { return `${item.unit} · ${MODE_LABEL[item.weightMode]}`; }
export function kg(weight: number, unit: 'kg'|'lb') { return unit === 'lb' ? weight * 0.45359237 : weight; }
// Comparable external load only; bodyweight/assisted movements have no inferred volume.
export function totalKg(weight: number, item: Pick<RoutineItem,'weightMode'|'unit'|'barWeight'>) {
  if (item.weightMode === 'bodyweight' || item.weightMode === 'assisted') return null;
  return kg(item.weightMode === 'perSide' ? weight * 2 + item.barWeight : item.weightMode === 'perDumbbell' ? weight * 2 : weight, item.unit);
}
export function volume(session: Session) { return session.exercises.reduce((sum,e) => sum + e.sets.reduce((s,set) => s + (set.done && !set.warmup ? (totalKg(set.weight,e) ?? 0) * set.reps : 0),0),0); }
export function lastExercise(sessions: Session[], exerciseId: string, before = Infinity, excludeId?: string) {
  return [...sessions].filter(s => s.status === 'completed' && s.startedAt < before && s.id !== excludeId)
    .sort((a,b) => b.startedAt-a.startedAt).flatMap(s => s.exercises.filter(e => e.exerciseId === exerciseId && e.sets.some(v => v.done)).map(e => ({ session: s, item: e })))[0];
}
export function createSession(routine: Routine, exercises: Exercise[], now = Date.now()): Session {
  if (!routine.items.length) throw new Error('Add an exercise to this routine first.');
  return { id: uid('session'), routineId: routine.id, routineName: routine.name, date: dateKey(new Date(now)), startedAt: now, status:'draft', notes:'',
    exercises: routine.items.map(item => {
      const e = exercises.find(v => v.id === item.exerciseId);
      if (!e) throw new Error('An exercise is missing from the catalogue.');
      return { ...item, name:e.name, muscles:e.muscles, equipment:e.equipment, sets:item.sets.map(s => ({...s,id:uid('set'),done:false,warmup:false})) };
    }) };
}
export function uniqueSchedule(entries: Schedule[]) { const map = new Map<string,Schedule>(); entries.forEach(e => map.set(`${e.date}:${e.routineId}`,e)); return [...map.values()].sort((a,b) => a.date.localeCompare(b.date)); }
export function rotationSchedule(start: string, cycle: string[], days: number): Schedule[] {
  if (!cycle.length) return [];
  return Array.from({length:days},(_,i) => ({id:uid('plan'),date:addDays(start,i),routineId:cycle[i%cycle.length]})).filter(v => v.routineId !== 'rest');
}
export function parseBackup(raw: string) {
  if(raw.length > 50_000_000) throw new Error('Backup is too large (maximum 50 MB).');
  const data = BackupSchema.parse(JSON.parse(raw)).data;
  const exerciseIds = new Set(data.exercises.map(e => e.id));
  const routineIds = new Set(data.routines.map(e => e.id));
  if(data.routines.some(r => r.items.some(i => !exerciseIds.has(i.exerciseId))) || data.schedule.some(s => !routineIds.has(s.routineId))) throw new Error('Backup has missing exercise or routine references.');
  if(data.sessions.filter(s => s.status === 'draft').length > 1) throw new Error('Backup contains multiple unfinished workouts.');
  // Notifications and absolute file paths belong to the original phone, never restore them.
  return { ...data, timer:{endAt:null,remaining:0,label:'Rest',notificationId:null}, exercises:data.exercises.map(e => ({...e,photo:e.photo?.match(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/)?e.photo:undefined,image:e.image?.startsWith('https://')?e.image:undefined})) } satisfies AppState;
}
export function measurementCsv(rows: Measurement[], metrics: MetricDefinition[]) {
  const quote=(v:string)=>`"${v.replaceAll('"','""')}"`;
  return ['date,'+metrics.map(m=>quote(m.key)).join(',')+',notes', ...rows.map(r => [r.date,...metrics.map(m=>r.values[m.key]??''),quote(r.notes)].join(','))].join('\n');
}
