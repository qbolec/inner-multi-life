canvas.addEventListener('click',(e)=>{
  const node=nodes.filter(n => distance(e,n)<=n.r)[0];
  if(node){
    if(selectedNode){
      if(selectedNode==node){
        console.log('deselecting',selectedNode)
        selectedNode=null;
      }else{
        const edge=edges.filter(e=>e.from==node && e.to==selectedNode || e.to==node && e.from==selectedNode )[0];
        if(edge){
          console.log('removing edge',edge)
          edges=edges.filter(e=>e!=edge);
        }else{
          console.log('adding edge',selectedNode,node)
          edges.push({
            from:selectedNode,
            to:node,
          });
        }
        selectedNode=node;
      }
    }else{
      selectedNode=node;
    }
  }else{
    const newNode={
      x:e.x,
      y:e.y,
      r:15,
      goal_x:e.x,
      goal_y:e.y,
      goal_r:15,
      rate:Math.PI*2/1000,
      phase:Math.random()*Math.PI*2,
      amplitude:0*Math.random()*10,
    }
    console.log('created',newNode)
    nodes.push(newNode);
    if(selectedNode){
      edges.push({
        from:selectedNode,
        to:newNode,
      });      
      console.log('created edge',selectedNode,newNode)
    }
    selectedNode=newNode;
  }
  edges.forEach(e=>{
    e.next=edges.filter(edge=>edge.from==e.to);
    e.previous=edges.filter(edge=>edge.to==e.from);
  });
  console.log('let nodes=' + JSON.stringify(nodes.map(n=>({x:n.goal_x,y:n.goal_y,r:n.goal_r,color:n.color}))));
  console.log('let edges=' + JSON.stringify(edges.map(e=>({from:nodes.indexOf(e.from),to:nodes.indexOf(e.to)}))));
});
document.addEventListener('keydown',(e)=>{
  if(selectedNode){
    const dir={
      ArrowRight:{x:1,y:0},
      ArrowLeft:{x:-1,y:0},
      ArrowUp:{x:0,y:-1},
      ArrowDown:{x:0,y:1},
    }[e.key];
    if(dir){
      selectedNode.goal_x+=dir.x;
      selectedNode.goal_y+=dir.y;      
    }
  }
});