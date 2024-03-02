selectedNode=null;

function updateEntity(e){
  if(!e.edge){
    e.edge=edges[edges
      .map((edge,i)=>({i,d:distance(e,nearestOnEdge(e,edge))}))
      .sort(({d:a},{d:b})=>a-b)[0].i]
  }
  const edge=e.edge;
  let o = offsetAlong(e,edge);
  const speed=e.speed||1;
  o+=speed;
  if(o<0){
    o=0;
  }else if(distance(edge.to,edge.from)<o){
    e.edge.sortedEntities=e.edge.sortedEntities.filter(en=>en!=e)
    e.edge=edge.next[Math.random()*edge.next.length|0]
    e.edge.sortedEntities.unshift(e)
  }
  const otherAxis=normal(normalize(subtract(edge.to,edge.from)));
  const new_pos=add(
    scale(otherAxis,4*Math.sin(e.phase+Date.now()/500)),
    atOffsetAlong(o,edge)
  );
  
  e.x=new_pos.x;
  e.y=new_pos.y;
}
function updateNode(node){
  node.x=node.goal_x+node.amplitude*Math.sin(node.phase+node.rate*Date.now());
  node.y=node.goal_y+node.amplitude*Math.cos(node.phase+node.rate*Date.now()); 
  node.r=node.goal_r+node.amplitude*(Math.cos(node.phase+node.rate*Date.now())**2); 
}
function updateEdge(edge){
  const crowd=entities.filter(n=>n.edge==edge)
  const os=crowd.map((n)=>
    ({o:offsetAlong(n,edge),n})
  ).sort(({o:o1},{o:o2})=>o1-o2)
  edge.sortedEntities=os.map(({n})=>n);
  os.forEach(({o,n},p)=>{
    n.speed=2;
    if(0<p && p+1<os.length){
      const b = o-os[p-1].o;
      const a = os[p+1].o-o;
      n.speed=(a/(b+a))*4;
    }
    
  })
}
function collect(edge,idx){
  const ses=edge.sortedEntities;
  if(idx<0){
    return edge.previous.map(e=>collect(e,e.sortedEntities.length+idx)).flat()
  }else if(ses.length<=idx){
    return edge.next.map(e=>collect(e,idx-ses.length)).flat()
  }
  return [ses[idx]];
}
function updateOptions(){
  if(hero.swap){
    hero.options=[];
  }else{
    const ses=hero.edge.sortedEntities;
    const idx=ses.indexOf(hero);
    hero.options=[collect(hero.edge,idx+2),collect(hero.edge,idx-2)].flat();
  }
}
const SWAP_DURATION_MS=200;
function step(){
  if(hero.swap && hero.swap.start+SWAP_DURATION_MS<Date.now()){
    const oldPos={x:hero.x,y:hero.y,edge:hero.edge};
    hero.x=hero.swap.other.x;
    hero.y=hero.swap.other.y;
    hero.edge=hero.swap.other.edge;
    
    hero.swap.other.x=oldPos.x;
    hero.swap.other.y=oldPos.y;
    hero.swap.other.edge=oldPos.edge;
    if(hero.swap.other.role=='food'){
      hero.r++;
      if(hero.r>=12){
        hero.big=true;
      }
    }
    if(hero.swap.other.role=='food'||hero.big&&hero.swap.other.role=='virus'){
      entities=entities.filter(e => e != hero.swap.other);
    }
    hero.swap=null;
  }
  edges.forEach(updateEdge)
  entities.forEach(updateEntity)
  nodes.forEach(updateNode)
  updateOptions()
  setTimeout(step,50);
}
draw()
step()

document.addEventListener('keydown',(e)=>{
  if(hero.swap||selectedNode||hero.infectedUntil>Date.now())return;
  const dir={
    ArrowRight:{x:1,y:0},
    ArrowLeft:{x:-1,y:0},
    ArrowUp:{x:0,y:-1},
    ArrowDown:{x:0,y:1},
  }[e.key];
  if(dir){
    const best=hero.options.map((e)=>
      ({e,s:scalar(dir,normalize(subtract(e,hero)))})
    ).filter(({s})=>s>0).sort(({s:s1},{s:s2})=>s2-s1)[0];
    if(best){
      hero.swap={other:best.e,start:Date.now()};
      if(!hero.big && best.e.role=='virus'){
        hero.infectedUntil=Date.now()+4000;
      }
    }
  }
});
window.focus();
canvas.click();