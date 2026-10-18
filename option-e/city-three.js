import * as THREE from './vendor/three-lite.js?v=5';
import {createNetworkModel,createNetworkTimeline} from './network-model.js?v=10';

// One E-only WebGL scene, driven by the existing visibility-aware 30 FPS controller.
export async function createCityRenderer(host,{mobile=false}={}){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power',stencil:false});
  renderer.setClearColor(0x12070a,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='e-city-canvas';renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x12070a,.026);
  const camera=new THREE.PerspectiveCamera(38,1,.1,90),model=createNetworkModel({mobile}),timeline=createNetworkTimeline(model);
  const {grid,buildings}=model;
  scene.add(new THREE.AmbientLight(0xc38b9c,1.35));
  const sun=new THREE.DirectionalLight(0xffd8ca,2.1);sun.position.set(4,14,7);scene.add(sun);
  const box=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D();
  const bodies=new THREE.InstancedMesh(box,new THREE.MeshLambertMaterial({color:0xffffff}),buildings.length);
  const bands=new THREE.InstancedMesh(box,new THREE.MeshBasicMaterial({color:0xb46f82}),buildings.length*3);
  const baseColors=buildings.map((b,i)=>{
    const family=i%7;
    if(family===1)return new THREE.Color().setHSL(.075,.12,b.lightness+.04); // warm stone
    if(family===3)return new THREE.Color().setHSL(.96,.32,b.lightness*.70); // deep burgundy
    if(family===5)return new THREE.Color().setHSL(.62,.10,b.lightness*.74); // charcoal slate
    return new THREE.Color().setHSL(.95,.18,b.lightness);
  });
  buildings.forEach((b,i)=>{
    dummy.position.set(b.x,b.h/2,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);bodies.setColorAt(i,baseColors[i]);
    for(let n=0;n<3;n++){dummy.position.set(b.x,b.h*(.3+n*.2),b.z);dummy.scale.set(b.w*1.007,.025,b.d*1.007);dummy.updateMatrix();bands.setMatrixAt(i*3+n,dummy.matrix);}
  });scene.add(bodies,bands);
  const roads=[],extent=grid/2*2.25;
  for(let n=0;n<=grid;n++){const v=(n-grid/2)*2.25;roads.push(v,.01,-extent,v,.01,extent,-extent,.01,v,extent,.01,v);}
  const roadGeo=new THREE.BufferGeometry();roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(roads,3));
  scene.add(new THREE.LineSegments(roadGeo,new THREE.LineBasicMaterial({color:0x61303e,transparent:true,opacity:.45})));
  const cableGeo=new THREE.CylinderGeometry(.34,.36,1,16),coreGeo=new THREE.CylinderGeometry(.285,.285,.035,16);
  const cableMat=new THREE.MeshLambertMaterial({color:0x67505b,transparent:true,opacity:0});
  const coreMat=new THREE.MeshBasicMaterial({color:0x0b0609,transparent:true,opacity:0});
  const base=new THREE.Vector3(...model.cableBase),tip=new THREE.Vector3(...model.source),direction=tip.clone().sub(base),cableLength=direction.length();direction.normalize();
  const cable=new THREE.Mesh(cableGeo,cableMat),core=new THREE.Mesh(coreGeo,coreMat);
  for(const object of [cable,core])object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction);
  cable.scale.y=cableLength;cable.position.copy(base).addScaledVector(direction,cableLength/2);core.position.copy(tip).addScaledVector(direction,.018);
  // A low ground collar anchors the emerging cable without adding a ground plane.
  const collar=new THREE.Mesh(coreGeo,cableMat);collar.scale.set(1.85,1.5,1.85);collar.position.copy(base);scene.add(cable,core,collar);
  const routePositions=[],routeRanges=[];
  for(const route of model.routes){const start=routePositions.length/3;for(let n=1;n<route.samples.length;n++)routePositions.push(...route.samples[n-1],...route.samples[n]);routeRanges.push({start,count:routePositions.length/3-start});}
  const routeGeo=new THREE.BufferGeometry(),routeColors=new Float32Array(routePositions.length);
  routeGeo.setAttribute('position',new THREE.Float32BufferAttribute(routePositions,3));routeGeo.setAttribute('color',new THREE.Float32BufferAttribute(routeColors,3));
  scene.add(new THREE.LineSegments(routeGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.95,depthWrite:false})));
  // One tiny generated sprite shared by the pulse heads and node halos. No bloom pass.
  const sprite=host.ownerDocument.createElement('canvas');sprite.width=sprite.height=64;
  const ctx=sprite.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(.16,'rgba(255,255,255,1)');gradient.addColorStop(.42,'rgba(255,255,255,.3)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const texture=new THREE.CanvasTexture(sprite);
  function points(count,size){
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(count*3),3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(count*3),3));
    const object=new THREE.Points(geometry,new THREE.PointsMaterial({map:texture,size,sizeAttenuation:true,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));object.frustumCulled=false;scene.add(object);return object;
  }
  const heads=points(model.routes.length,.30),halos=points(model.nodes.length,.85),cores=points(model.nodes.length,.22);
  const headGlow=new THREE.Points(heads.geometry,new THREE.PointsMaterial({map:texture,size:.65,opacity:.35,sizeAttenuation:true,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));headGlow.frustumCulled=false;scene.add(headGlow);
  for(const object of [halos,cores])model.nodes.forEach((node,i)=>object.geometry.attributes.position.array.set(node.position,i*3));
  const tailSegments=7,tailCount=model.routes.length*tailSegments*2,tailGeo=new THREE.BufferGeometry();
  tailGeo.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(tailCount*3),3));tailGeo.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(tailCount*3),3));
  const tails=new THREE.LineSegments(tailGeo,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));tails.frustumCulled=false;scene.add(tails);
  const a=new Float32Array(3),b=new Float32Array(3),color=new THREE.Color(),activationColor=new THREE.Color(0xffcfb7);
  const signalColor=new THREE.Color(0xffd8c7),routeColor=new THREE.Color(0xa93b56);
  const updatedGeometries=[routeGeo,heads.geometry,halos.geometry,cores.geometry,tailGeo];
  const info={drawCalls:0,triangles:0,buildings:buildings.length,pixelRatio:1,bufferWidth:0,bufferHeight:0,networkStage:'opening',activeSignals:0,litBuildings:0,networkCycle:0,routes:model.routes.length,endpoints:model.nodes.filter(n=>n.kind==='endpoint').length,geometries:0,textures:0};
  let ratio=1,disposed=false;
  function resize(){
    const rect=host.getBoundingClientRect(),scale=Math.min(1,(mobile?600:860)/Math.max(1,rect.width),400/Math.max(1,rect.height));
    renderer.setPixelRatio(ratio);renderer.setSize(Math.max(1,Math.round(rect.width*scale)),Math.max(1,Math.round(rect.height*scale)),false);
    camera.aspect=Math.max(1,rect.width)/Math.max(1,rect.height);camera.updateProjectionMatrix();
  }
  camera.position.set(16,11,18);camera.lookAt(0,1,0);resize();host.append(renderer.domElement);
  try{await renderer.compileAsync(scene,camera);}catch(error){destroy();throw error;}
  function setRGB(array,index,c,level){array[index]=c.r*level;array[index+1]=c.g*level;array[index+2]=c.b*level;}
  function render(time){
    const angle=.72+Math.sin(time/40)*.05,distance=mobile?17:21;
    camera.position.set(Math.sin(angle)*distance,mobile?9:10.5,Math.cos(angle)*distance);camera.lookAt(0,1,0);
    const state=timeline.update(time);cableMat.opacity=coreMat.opacity=state.sourceLevel;
    let litBuildings=0;
    for(let i=0;i<buildings.length;i++){const level=state.buildings[i];if(level>.1)litBuildings++;color.copy(baseColors[i]).lerp(activationColor,level*.42);bodies.setColorAt(i,color);}bodies.instanceColor.needsUpdate=true;
    state.paths.forEach((p,i)=>{
      const range=routeRanges[i],base=(p.route.kind==='strand'?.62:.42)*state.sourceLevel;
      for(let n=range.start;n<range.start+range.count;n++)setRGB(routeColors,n*3,routeColor,base+p.level*1.2);
      heads.geometry.attributes.position.array.set(p.head,i*3);setRGB(heads.geometry.attributes.color.array,i*3,signalColor,p.active?1.7:0);
      for(let s=0;s<tailSegments;s++){
        p.route.sample(Math.max(0,p.progress-s*.025),a);p.route.sample(Math.max(0,p.progress-(s+1)*.025),b);
        const at=(i*tailSegments+s)*6;tailGeo.attributes.position.array.set(a,at);tailGeo.attributes.position.array.set(b,at+3);
        const strength=p.level*Math.pow(1-s/tailSegments,2)*1.2;setRGB(tailGeo.attributes.color.array,at,signalColor,strength);setRGB(tailGeo.attributes.color.array,at+3,signalColor,strength*.7);
      }
    });
    for(let i=0;i<model.nodes.length;i++){
      const node=model.nodes[i],level=node.kind==='origin'?state.sourceLevel*.55:state.nodes[i];
      setRGB(halos.geometry.attributes.color.array,i*3,signalColor,level*1.1);
      setRGB(cores.geometry.attributes.color.array,i*3,signalColor,node.kind==='origin'?level:state.sourceLevel*.16+level);
    }
    routeGeo.attributes.color.array.set(routeColors);
    for(const geometry of updatedGeometries){geometry.attributes.color.needsUpdate=true;if(geometry===heads.geometry||geometry===tailGeo)geometry.attributes.position.needsUpdate=true;}
    renderer.render(scene,camera);
    info.drawCalls=renderer.info.render.calls;info.triangles=renderer.info.render.triangles;info.pixelRatio=ratio;info.bufferWidth=renderer.domElement.width;info.bufferHeight=renderer.domElement.height;
    info.networkStage=state.stage;info.activeSignals=state.activeSignals;info.litBuildings=litBuildings;info.networkCycle=Math.round(state.cycleTime*100)/100;info.geometries=renderer.info.memory.geometries;info.textures=renderer.info.memory.textures;return info;
  }
  function simplify(){ratio=Math.min(ratio,.75);resize();}
  function destroy(){
    if(disposed)return;disposed=true;const geometries=new Set(),materials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)for(const material of [].concat(object.material))materials.add(material);});
    geometries.forEach(geometry=>geometry.dispose());materials.forEach(material=>material.dispose());texture.dispose();renderer.dispose();renderer.domElement.remove();
  }
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.dispatchEvent(new CustomEvent('e:city-failed'));});
  return {render,resize,simplify,destroy};
}
