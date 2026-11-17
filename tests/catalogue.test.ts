import {describe,it,expect,vi,afterEach} from 'vitest';
import {downloadWger,searchNinjas,downloadFreeDb} from '../src/services/catalogue';

afterEach(()=>vi.unstubAllGlobals());
const response=(data:unknown)=>({ok:true,json:async()=>data});
describe('exercise providers',()=>{
 it('maps the wger API contract and preserves author and license',async()=>{const fetch=vi.fn().mockResolvedValue(response({next:null,results:[{id:9,muscles:[{name:'Pectoralis',name_en:'Chest'}],muscles_secondary:[{name:'Triceps'}],equipment:[{name:'Barbell'}],translations:[{name:'Bench',language:2,description:'<p>Lift &amp; lower</p>',license_author:'Author'}],license:{full_name:'CC BY SA 4',url:'https://creativecommons.org/licenses/by-sa/4.0/'},license_author:'Author',images:[]}]}));vi.stubGlobal('fetch',fetch);const [row]=await downloadWger();expect(row.muscles).toEqual(['Chest']);expect(row.equipment).toBe('Barbell');expect(row.instructions).toBe('Lift & lower');expect(row.attribution).toContain('Author');expect(row.license).toContain('CC BY SA');});
 it('sends only exercise search terms and API key to Ninjas',async()=>{const fetch=vi.fn().mockResolvedValue(response([{name:'Leg Curl',muscle:'hamstrings',equipments:['machine'],instructions:'Curl'}]));vi.stubGlobal('fetch',fetch);const [row]=await searchNinjas('leg curl','local-key');expect(row.equipment).toBe('machine');expect(fetch.mock.calls[0][0]).toContain('name=leg%20curl');expect(fetch.mock.calls[0][1].headers).toEqual({'X-Api-Key':'local-key'});});
 it('maps the downloadable dataset including equipment and image',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response([{id:'Curl',name:'Curl',primaryMuscles:['biceps'],secondaryMuscles:[],equipment:'dumbbell',instructions:['Step 1'],images:['Curl/0.jpg']}])));const [row]=await downloadFreeDb();expect(row.equipment).toBe('dumbbell');expect(row.image).toContain('Curl/0.jpg');});
 it('reports rate limits and missing keys',async()=>{await expect(searchNinjas('curl','')).rejects.toThrow('key');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:429}));await expect(searchNinjas('curl','key')).rejects.toThrow('rate limiting');});
});
