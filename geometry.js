const len=({x,y})=>Math.sqrt(x**2+y**2)
const subtract=(a,b)=>
  ({x:a.x-b.x,y:a.y-b.y});
const add=(a,b)=>
  ({x:a.x+b.x,y:a.y+b.y});
const distance=(from,to)=>
  len(subtract(to,from));
const azimuth=(p)=>
  Math.atan2(p.y,p.x);

const direction=(from,to)=>
  azimuth(subtract(to,from))

const polar=(a,r)=>
  ({x:Math.cos(a)*r,y:Math.sin(a)*r});
const scalar=(a,b)=>a.x*b.x+a.y*b.y
const point2array=(p)=>[p.x,p.y]
const scale=(p,s)=>({x:p.x*s,y:p.y*s})
const normalize=(p)=>scale(p,1.0/len(p))
const normal=({x,y})=>({x:-y,y:x})
const offsetAlong=(p,edge)=>{
  const p_rel=subtract(p,edge.from);
  const to_rel=subtract(edge.to,edge.from);
  return scalar(p_rel,to_rel)/len(to_rel);
}
const atOffsetAlong=(o,edge)=>
  add(edge.from,scale(normalize(subtract(edge.to,edge.from)) ,o));
function nearestOnEdge(p,edge){
  const o = offsetAlong(p,edge)
  if(o<0)
    return edge.from;
  if(distance(edge.from,edge.to)<o)
    return edge.to;
  return atOffsetAlong(o,edge);
}
