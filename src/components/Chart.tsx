import React from 'react';
import { View,Text,useWindowDimensions } from 'react-native';
import Svg,{Path,Circle,Line,Text as SvgText} from 'react-native-svg';
import { C,s } from './ui';
export function Chart({points,unit='',color=C.lime}:{points:{label:string;value:number}[];unit?:string;color?:string}){
  const window=useWindowDimensions(); const width=Math.min(window.width-80,600),height=160;
  if(!points.length)return <Text style={s.muted}>Record a reading or complete a workout to see your trend.</Text>;
  const data=points.slice(-24);const min=Math.min(...data.map(p=>p.value)),max=Math.max(...data.map(p=>p.value)),range=max-min||1;
  const coords=data.map((p,i)=>({x:12+(data.length===1?0.5:i/(data.length-1))*(width-24),y:20+(1-(p.value-min)/range)*105}));
  const path=coords.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');
  return <View style={{gap:6}}><View style={s.between}><Text style={s.muted}>{min.toFixed(1)}–{max.toFixed(1)} {unit}</Text><Text style={[s.h3,{color}]}>{data.at(-1)!.value.toFixed(1)} {unit}</Text></View><Svg accessibilityLabel={data.map(p=>`${p.label}: ${p.value} ${unit}`).join('; ')} width={width} height={height} viewBox={`0 0 ${width} ${height}`}><Line x1={0} x2={width} y1={130} y2={130} stroke={C.line}/><Line x1={0} x2={width} y1={75} y2={75} stroke={C.line} strokeDasharray="3 5"/><Path d={path} stroke={color} strokeWidth={3} fill="none"/>{coords.map((p,i)=><Circle key={i} cx={p.x} cy={p.y} r={4} fill={color}/>)}<SvgText x={0} y={151} fill={C.muted} fontSize={10}>{data[0].label}</SvgText><SvgText x={width} y={151} textAnchor="end" fill={C.muted} fontSize={10}>{data.at(-1)!.label}</SvgText></Svg></View>;
}
