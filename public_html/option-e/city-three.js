import * as THREE from './vendor/three-lite.js';

// E-only procedural scene. No imported models, textures, shadows or postprocessing.
export async function createCityRenderer(host,{mobile=false}={}){
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power',stencil:false});
  renderer.setClearColor(0x12070a,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.className='e-city-canvas';renderer.domElement.setAttribute('aria-hidden','true');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0x12070a,.042);
  const camera=new THREE.PerspectiveCamera(38,1,.1,90);
  scene.add(new THREE.AmbientLight(0xc38b9c,1.35));
  const sun=new THREE.DirectionalLight(0xffd8ca,2.1);sun.position.set(4,14,7);scene.add(sun);
  const buildings=[],grid=mobile?5:8;
  let seed=137;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let x=0;x<grid;x++)for(let z=0;z<grid;z++){
    const central=1-Math.min(1,Math.hypot(x-grid/2,z-grid/2)/grid);
    buildings.push({x:(x-(grid-1)/2)*2.25,z:(z-(grid-1)/2)*2.25,w:.7+random()*.65,d:.75+random()*.55,h:1.1+random()*5.4*central});
  }
  const box=new THREE.BoxGeometry(1,1,1),bodyMat=new THREE.MeshLambertMaterial({color:0xffffff});
  const bodies=new THREE.InstancedMesh(box,bodyMat,buildings.length),dummy=new THREE.Object3D();
  const glassMat=new THREE.MeshBasicMaterial({color:0x8b4959});
  const bands=new THREE.InstancedMesh(box,glassMat,buildings.length*3);
  buildings.forEach((b,i)=>{
    dummy.position.set(b.x,b.h/2,b.z);dummy.scale.set(b.w,b.h,b.d);dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);
    bodies.setColorAt(i,new THREE.Color().setHSL(.95,.18,.21+random()*.14));
    for(let n=0;n<3;n++){dummy.position.set(b.x,b.h*(.3+n*.2),b.z);dummy.scale.set(b.w*1.007,.025,b.d*1.007);dummy.updateMatrix();bands.setMatrixAt(i*3+n,dummy.matrix);}
  });scene.add(bodies,bands);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(28,28),new THREE.MeshBasicMaterial({color:0x1e0b11}));ground.rotation.x=-Math.PI/2;ground.position.y=-.03;scene.add(ground);
  const roads=[];
  for(let n=0;n<=grid;n++){const v=(n-grid/2)*2.25;roads.push(v,.01,-13,v,.01,13,-13,.01,v,13,.01,v);}
  const roadGeo=new THREE.BufferGeometry();roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(roads,3));
  scene.add(new THREE.LineSegments(roadGeo,new THREE.LineBasicMaterial({color:0x61303e,transparent:true,opacity:.5})));
  const routes=[],routeVertices=[];
  for(let n=0;n<(mobile?7:13);n++){
    const a=buildings[(n*5+2)%buildings.length],b=buildings[(n*11+9)%buildings.length];
    const start=new THREE.Vector3(a.x,a.h+.1,a.z),end=new THREE.Vector3(b.x,b.h+.1,b.z);
    const arc=(t,target)=>target.copy(start).lerp(end,t).setY(start.y+(end.y-start.y)*t+Math.sin(t*Math.PI)*1.3);
    const points=[];for(let p=0;p<=16;p++)points.push(arc(p/16,new THREE.Vector3()));
    for(let p=0;p<16;p++)routeVertices.push(...points[p].toArray(),...points[p+1].toArray());
    routes.push({arc,offset:n*.17});
  }
  const routesGeo=new THREE.BufferGeometry();routesGeo.setAttribute('position',new THREE.Float32BufferAttribute(routeVertices,3));
  scene.add(new THREE.LineSegments(routesGeo,new THREE.LineBasicMaterial({color:0xc53751,transparent:true,opacity:.68})));
  const pulseGeo=new THREE.BufferGeometry(),pulsePositions=new Float32Array(routes.length*3);
  pulseGeo.setAttribute('position',new THREE.Float32BufferAttribute(pulsePositions,3));
  const lights=new THREE.Points(pulseGeo,new THREE.PointsMaterial({color:0xff9d9b,size:mobile?.17:.14,sizeAttenuation:true}));scene.add(lights);
  const point=new THREE.Vector3();
  let ratio=mobile?1:Math.min(window.devicePixelRatio||1,1.25),disposed=false;
  function resize(){
    const rect=host.getBoundingClientRect(),scale=Math.min(1,1100/Math.max(1,rect.width),560/Math.max(1,rect.height));
    const width=Math.max(1,Math.round(rect.width*scale)),height=Math.max(1,Math.round(rect.height*scale));
    renderer.setPixelRatio(ratio);renderer.setSize(width,height,false);camera.aspect=Math.max(1,rect.width)/Math.max(1,rect.height);camera.updateProjectionMatrix();
  }
  camera.position.set(16,11,18);camera.lookAt(0,1,0);resize();host.append(renderer.domElement);
  try{await renderer.compileAsync(scene,camera);}catch(error){destroy();throw error;}
  function render(time){
    const angle=.72+Math.sin(time/52)*.045,distance=mobile?22:25;
    camera.position.set(Math.sin(angle)*distance,11.5,Math.cos(angle)*distance);camera.lookAt(0,1,0);
    routes.forEach((r,i)=>{r.arc((time*.065+r.offset)%1,point);pulsePositions[i*3]=point.x;pulsePositions[i*3+1]=point.y;pulsePositions[i*3+2]=point.z;});
    pulseGeo.attributes.position.array.set(pulsePositions);pulseGeo.attributes.position.needsUpdate=true;
    renderer.render(scene,camera);
    return {drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,buildings:buildings.length,pixelRatio:ratio,bufferWidth:renderer.domElement.width,bufferHeight:renderer.domElement.height};
  }
  function simplify(){ratio=Math.min(ratio,.75);resize();}
  function destroy(){if(disposed)return;disposed=true;scene.traverse(object=>{object.geometry?.dispose();if(object.material)for(const material of [].concat(object.material))material.dispose();});renderer.dispose();renderer.domElement.remove();}
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();host.dispatchEvent(new CustomEvent('e:city-failed'));});
  return {render,resize,simplify,destroy};
}
