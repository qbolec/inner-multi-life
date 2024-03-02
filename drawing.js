const ctx = canvas.getContext('2d');
ctx.lineWidth = 1;

function circle(c,pen){
  ctx.fillStyle=pen
  ctx.beginPath();
  ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
  ctx.fill();
}

function branch(from,to){
  circle(from,from.color||'red')
  circle(to,to.color||'red')
  const gradient = 
    ctx.createLinearGradient(from.x,from.y, to.x,to.y);

  gradient.addColorStop(0, from.color||'red');
  gradient.addColorStop(1, to.color||'red');
  ctx.fillStyle=gradient
  const d=distance(from,to);
  const cos=(from.r-to.r)/d;
  const a=Math.acos(cos);
  const b=direction(from,to);
  const points=[];
  for(let i=-1;i<=1;i+=2){
    const c = b+i*a;
    [from,to].map(p=>
      points.push(add(p,polar(c,p.r)))
    )  
  }
  const arrays=points.map(point2array)
  ctx.beginPath();
  ctx.moveTo(...arrays[0]);
  ctx.lineTo(...arrays[1]);
  ctx.lineTo(...arrays[3]);
  ctx.lineTo(...arrays[2]);
  ctx.closePath();
  // ctx.strokeStyle='white';
  ctx.fill();
}
function putPixel({x,y},color){
  ctx.fillStyle = color;
  ctx.fillRect( x, y, 1, 1 );
}
function drawVirus(e){
  const LEGS=6;
  const t=e.phase+Date.now()/200;
  for(let i=0;i<LEGS;++i){
    const dir=polar(i/LEGS*Math.PI*2,1);
    const other=normal(dir);
    const LEN=7;
    for(let j=0;j<LEN;++j){
      const pixelPos=add(e,add(
        scale(dir,e.r+j),
        scale(other,Math.sin(t+j/LEN*Math.PI)*3)
      ))
      putPixel(pixelPos,'black');
    }
  }
  circle(e,'black');
}
function drawCrystal(e){
  const t=e.phase+Date.now()/200;
  const points=[0,1,2].map(i=>point2array(add(e,polar(t+i/3*2*Math.PI,e.r))))
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for(let i=1;i<points.length;++i){
    ctx.lineTo(...points[i]);
  }
  ctx.closePath();
  ctx.fillStyle='green';
  ctx.fill();  
}
function drawHero(e){
  const o={...e,r:Math.min(e.r,12)};
  if(e.infectedUntil>Date.now()){
    const gradient=ctx.createRadialGradient(e.x,e.y,0, e.x,e.y,o.r);
    gradient.addColorStop(0,'red');
    gradient.addColorStop(1,'white');   
    return circle(o,gradient);
  }
  if(!e.big){
    return circle(o,'white');
  }
  const gradient=ctx.createRadialGradient(e.x+4,e.y-4,4, e.x,e.y,10);
  const c = Date.now()%500<200;
  gradient.addColorStop(0,c?'pink':'lightblue');
  gradient.addColorStop(0.9,'white');
  gradient.addColorStop(1,c?'lightblue':'yellow');
  circle(o,gradient);
}
function drawEntity(e){
  ({
    'virus':drawVirus,
    'hero':drawHero,
    'blood':(e)=>circle(e,'blue'),
    'food':(e)=>circle(e,'rgb(100,0,0)'),
    'crystal':drawCrystal,
  })[e.role](e);
}

function draw(){
  ctx.fillStyle='black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  edges.forEach(e=>
    branch({
      ...e.from,
      color:'violet',
      r:e.from.r+3,
    },{
      ...e.to,  
      color:'violet',
      r:e.to.r+3,
    })
  )
  edges.forEach(e=>branch(e.from,e.to));
  hero.options.forEach(e=>{if(e)circle({
    ...e,
    r:e.r+2
  },'white')});
  entities.forEach(e=>{
    if(hero.swap&&(hero==e||hero.swap.other==e)){
      const f=(Date.now()-hero.swap.start)/SWAP_DURATION_MS;
      const f2=hero==e?f:1-f;
      const route=subtract(hero.swap.other,hero);
      const side=normal(normalize(route));
      const pos=add(
        add(hero,scale(route,f2)),
        scale(side,Math.sin(f*Math.PI)*10*(hero==e?1:-1))
      );
      drawEntity({
        ...e,
        ...pos,
      });
    }else{
      drawEntity(e);
    }
  });
  if(selectedNode)circle(selectedNode,'yellow');
  window.requestAnimationFrame(draw)
}
