import * as THREE from 'three';
import { createMorph } from './dna.js';
import { STLLoader } from './vendor/STLLoader.js';
import { OrbitControls } from './vendor/OrbitControls.js';

export async function createDevice(container, onSelect) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  container.append(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','3D wristband: drag to turn it in any direction, right-drag or Shift-drag to move it, Ctrl + scroll to zoom; scroll to follow the DNA stream. Arrow keys turn; Shift and arrow keys move; plus and minus zoom.');
  renderer.domElement.tabIndex=0;
  renderer.domElement.addEventListener('wheel',event=>{if(!event.ctrlKey)event.stopImmediatePropagation();},{capture:true,passive:true});
  const interactionSurface=document.createElement('div');interactionSurface.className='model-input';interactionSurface.tabIndex=0;interactionSurface.setAttribute('role','img');interactionSurface.setAttribute('aria-label',renderer.domElement.getAttribute('aria-label'));container.append(interactionSurface);renderer.domElement.tabIndex=-1;
  interactionSurface.addEventListener('wheel',event=>{if(!event.ctrlKey)event.stopImmediatePropagation();},{capture:true,passive:true});
  const controls = new OrbitControls(camera,interactionSurface);
  controls.enableDamping = !reduceMotion.matches;controls.dampingFactor=.25; // moves stop close to where the pointer stops
  controls.enablePan=true;controls.screenSpacePanning=true;controls.minDistance=35;controls.maxDistance=450;
  controls.minPolarAngle=0;controls.maxPolarAngle=Math.PI;controls.enableZoom=true;
  // One-finger / left drags turn the model itself (below); the controls keep move and zoom.
  // With rotation off, OrbitControls maps Shift/Ctrl/Cmd + left drag to moving the model.
  controls.enableRotate=false;
  controls.mouseButtons={LEFT:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.PAN};
  controls.touches={ONE:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};
  renderer.domElement.style.touchAction='none';
  // Gestures are captured only over the model; the rest of the page scrolls normally.
  if(matchMedia('(pointer:coarse)').matches) {
    document.querySelector('.stage-bottom>span').textContent='Drag the model to turn · swipe the sides to scroll';
  }
  scene.add(new THREE.HemisphereLight(0xc6dfff,0x44526b,2.7));
  const key=new THREE.DirectionalLight(0xffffff,4.0);key.position.set(-60,100,80);scene.add(key);
  const rim=new THREE.DirectionalLight(0x70b9ff,2.4);rim.position.set(30,50,-60);scene.add(rim);
  const fill=new THREE.DirectionalLight(0xffedcf,1.0);fill.position.set(60,10,40);scene.add(fill);
  const underside=new THREE.DirectionalLight(0xbcd7f4,1.8);underside.position.set(15,-70,45);scene.add(underside);
  // The model turns about a pivot kept at the camera's framing point, so it spins in place even when exploded.
  const pivot=new THREE.Group(),pivotOffset=new THREE.Group();scene.add(pivot);pivot.add(pivotOffset);
  const assembly=new THREE.Group();assembly.rotation.x=-Math.PI/2;pivotOffset.add(assembly);
  const loader=new STLLoader();
  const [bodyGeo,cartridgeGeo]=await Promise.all([loader.loadAsync('assets/body.stl'),loader.loadAsync('assets/cartridge.stl')]);
  // Original shared CAD origins are retained. No per-part centering or scaling.
  bodyGeo.computeVertexNormals();cartridgeGeo.computeVertexNormals();
  const cartridgeAssembly=new THREE.Group();assembly.add(cartridgeAssembly);
  const parts={}; const selectable=[];
  function register(key,object,baseZ=0,explodeZ=0){object.userData.part=key;object.userData.baseZ=baseZ;object.userData.explodeZ=explodeZ;object.position.z=baseZ;(key==='body'?assembly:cartridgeAssembly).add(object);parts[key]=object;object.traverse(child=>{if(child.isMesh){child.userData.part=key;selectable.push(child);}});return object;}
  const bodyMaterial=new THREE.MeshStandardMaterial({color:0x252c37,roughness:.84,metalness:.05});
  register('body',new THREE.Mesh(bodyGeo,bodyMaterial));
  const cartMaterial=new THREE.MeshStandardMaterial({color:0x141921,roughness:.87,metalness:.03});
  register('cartridge',new THREE.Mesh(cartridgeGeo,cartMaterial));
  const backing=new THREE.Group();
  for(const x of [-7.5,7.5]){const b=new THREE.Mesh(new THREE.BoxGeometry(11.8,11.8,.18),new THREE.MeshStandardMaterial({color:0xf4f1df,roughness:1}));b.position.set(x,0,4.72);backing.add(b);}
  register('backing',backing,0,10);
  const filmMaterial=new THREE.MeshStandardMaterial({color:0xdcad32,roughness:.72,metalness:0});
  for(const [name,x] of [['sensing',-7.5],['reference',7.5]]){
    const film=new THREE.Mesh(new THREE.BoxGeometry(11.55,11.55,.14),filmMaterial.clone());film.position.x=x;
    register(name,film,4.92,19);
  }
  const cover=new THREE.Mesh(new THREE.BoxGeometry(11.75,11.75,.22),new THREE.MeshPhysicalMaterial({color:0xe1eaf6,roughness:.18,metalness:0,transparent:true,opacity:.18,depthWrite:false,side:THREE.DoubleSide}));cover.position.x=7.5;
  register('cover',cover,5.16,28);
  // An illustrative print, based on the supplied photograph; no invented identity QR.
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=750;const ctx=canvas.getContext('2d');
  ctx.fillStyle='#a8aaac';ctx.fillRect(0,0,768,750);
  const grey=['#f0f0ec','#babbb9','#888b8c','#494e50','#151b20'];
  const warm=['#e1c687','#d5a436','#9b6931','#473122'];
  for(const y of [45,603]){
    grey.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(187+i*78,y,77,42);});
    warm.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(187+i*97.5,y+43,97,45);});
  }
  const marks=[[36,43],[611,43],[36,593],[611,593]];
  marks.forEach(([x,y],m)=>{ctx.fillStyle='#eee';ctx.fillRect(x,y,119,119);ctx.fillStyle='#111';ctx.fillRect(x+10,y+10,99,99);ctx.fillStyle='#eee';for(let r=0;r<4;r++)for(let c=0;c<4;c++)if((r*3+c+m)%3===0 || (r===2&&c===2))ctx.fillRect(x+21+c*20,y+21+r*20,19,19);});
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const shape=new THREE.Shape();shape.moveTo(-15.6,-15.2);shape.lineTo(15.6,-15.2);shape.lineTo(15.6,15.2);shape.lineTo(-15.6,15.2);shape.closePath();
  for(const [x1,x2,y1,y2] of [[-13.7,-1.3,-6.2,6.2],[.0,15,-7.5,7.5]]){const hole=new THREE.Path();hole.moveTo(x1,y1);hole.lineTo(x1,y2);hole.lineTo(x2,y2);hole.lineTo(x2,y1);hole.closePath();shape.holes.push(hole);}
  const printGeo=new THREE.ShapeGeometry(shape);const positions=printGeo.attributes.position;const uvs=printGeo.attributes.uv;
  for(let i=0;i<positions.count;i++)uvs.setXY(i,(positions.getX(i)+16)/32,(positions.getY(i)+15.6)/31.2);
  const print=new THREE.Mesh(printGeo,new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));
  // The sticker is pasted to the cartridge's z=6 face, never the z=8 housing.
  // It travels with the complete cartridge; only the layer view lifts it away.
  register('optics',print,6.035,38);
  const strapMaterial=new THREE.MeshStandardMaterial({color:0x141a21,roughness:1});
  const straps=new THREE.Group();for(const x of [-40.5,40.5]){const s=new THREE.Mesh(new THREE.BoxGeometry(34,20,1.9),strapMaterial);s.position.set(x,0,1.4);straps.add(s);}
  assembly.add(straps);
  const grid=new THREE.GridHelper(150,15,0x36516e,0x24394f);grid.position.y=-5;grid.material.transparent=true;grid.material.opacity=.26;scene.add(grid);
  let exploded=false,targetPhase=0,amount=0,visible=true,selected='body',lastTime=0;
  const phase={value:0,target:0,velocity:0,precision:5e-4};
  const smooth=value=>value*value*(3-2*value);
  function pose(){return {removed:smooth(Math.min(amount,1)),opened:smooth(Math.max(0,amount-1))};}
  function framing(){const {removed,opened}=pose();return new THREE.Vector3(0,7+opened*14,-removed*27.5);}
  function select(name){selected=name;for(const [key,object]of Object.entries(parts)){object.traverse(child=>{if(child.isMesh&&child.material.emissive){child.material.emissive.set(key===name?0x153351:0x000000);child.material.emissiveIntensity=key===name?.15:0;}});}onSelect(name);}
  const raycaster=new THREE.Raycaster();let start={x:0,y:0};
  interactionSurface.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY};});
  interactionSurface.addEventListener('pointerup',e=>{if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>6)return;const box=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1),camera);const hit=raycaster.intersectObjects(selectable).find(h=>h.object.userData.part);if(hit)select(hit.object.userData.part);});
  // Critically damped springs (Apple's response/damping-ratio form) integrated in small fixed steps.
  function stepSpring(spring,dt,response,damping=1){
    const k=(2*Math.PI/response)**2,c=4*Math.PI*damping/response;
    for(let t=dt;t>0;t-=1/240){const h=Math.min(t,1/240);spring.velocity+=(-k*(spring.value-spring.target)-c*spring.velocity)*h;spring.value+=spring.velocity*h;}
    if(Math.abs(spring.value-spring.target)<spring.precision&&Math.abs(spring.velocity)<spring.precision*10){spring.value=spring.target;spring.velocity=0;return false;}
    return true;
  }
  // Camera presets glide from the live view on independent springs (orbit radius/angles and target axes).
  // Grabbing the model, or a key press, interrupts the glide immediately.
  let glide=null;
  function glideTo(target,spherical,{wrap=true,response=.55}={}){
    const keep=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=keep; // flush drag inertia
    const from=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    if(reduceMotion.matches){glide=null;controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();return;}
    const theta=wrap?from.theta+Math.atan2(Math.sin(spherical.theta-from.theta),Math.cos(spherical.theta-from.theta)):spherical.theta;
    const spring=(key,value,goal,precision)=>({value:glide?.springs[key]?.value??value,target:goal,velocity:glide?.springs[key]?.velocity??0,precision});
    glide={response,springs:{radius:spring('radius',from.radius,spherical.radius,.01),phi:spring('phi',from.phi,THREE.MathUtils.clamp(spherical.phi,.001,Math.PI-.001),1e-4),theta:spring('theta',from.theta,theta,1e-4),x:spring('x',controls.target.x,target.x,.005),y:spring('y',controls.target.y,target.y,.005),z:spring('z',controls.target.z,target.z,.005)}};
  }
  function glideGoal(){
    if(glide){const s=glide.springs;return {target:new THREE.Vector3(s.x.target,s.y.target,s.z.target),spherical:new THREE.Spherical(s.radius.target,s.phi.target,s.theta.target)};}
    return {target:controls.target.clone(),spherical:new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target))};
  }
  // Direct manipulation: the model follows the pointer about camera-relative axes, with no pole lock and no throw.
  const upright=new THREE.Quaternion();let drag=null,straighten=null,homeAt=0;const touches=new Set();
  const turnRate=()=>Math.PI*.6/Math.max(320,renderer.domElement.clientHeight); // about a third of a turn per viewport height
  // After the visitor lets go, the model waits briefly, then eases slowly back to the default view.
  const HOME_DELAY=1000,HOME_RESPONSE=1.6;
  const scheduleHome=()=>{}; // Retain the chosen inspection angle until Reset view.
  const stopAutoMotion=()=>{homeAt=0;straighten=null;glide=null;};
  function turn(ax,ay){
    const up=new THREE.Vector3(0,1,0).applyQuaternion(camera.quaternion),right=new THREE.Vector3(1,0,0).applyQuaternion(camera.quaternion);
    pivot.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(up,ax).multiply(new THREE.Quaternion().setFromAxisAngle(right,ay))).normalize();
  }
  function settleUpright(response=.55){
    // Presets spring the model back to its CAD orientation so "Top" and "Bottom" stay true.
    if(reduceMotion.matches){pivot.quaternion.identity();straighten=null;return;}
    if(pivot.quaternion.angleTo(upright)>1e-4)straighten={from:pivot.quaternion.clone(),response,progress:{value:0,target:1,velocity:0,precision:1e-4}};
  }
  const surface=interactionSurface;
  surface.addEventListener('pointerdown',e=>{
    if(e.pointerType==='touch')touches.add(e.pointerId);
    stopAutoMotion(); // a grab stops any glide or return immediately
    if(touches.size>1||(e.pointerType==='mouse'&&(e.button!==0||e.shiftKey||e.ctrlKey||e.metaKey))){drag=null;return;}
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  });
  surface.addEventListener('pointermove',e=>{
    if(!drag||e.pointerId!==drag.id)return;
    if(touches.size>1){drag=null;return;}
    const rate=turnRate();turn((e.clientX-drag.x)*rate,(e.clientY-drag.y)*rate);drag.x=e.clientX;drag.y=e.clientY;drag.moved=true;
  });
  function release(e){
    touches.delete(e.pointerId);
    if(!drag||e.pointerId!==drag.id)return;
    const moved=drag.moved;drag=null;
    if(moved)scheduleHome(); // the model stays exactly where it was released until the return begins
  }
  surface.addEventListener('pointerup',release);surface.addEventListener('pointercancel',release);
  function reset(instant=false,response=.55){
    camera.zoom=(camera.aspect<.85?1.1:.8)*Math.min(1,camera.aspect/1.25)*(1-pose().removed*.12-pose().opened*.12);camera.updateProjectionMatrix();
    const goal=new THREE.Spherical().setFromVector3(new THREE.Vector3(63,93,115));
    homeAt=0;
    if(instant){glide=null;straighten=null;pivot.quaternion.identity();controls.target.copy(framing());camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(goal));controls.update();return;}
    settleUpright(response);glideTo(framing(),goal,{response});
  }
  function rotate(direction,axis='horizontal'){
    // Steps accumulate on the glide's goal, so repeated presses keep one continuous motion.
    const {target,spherical}=glideGoal();
    if(axis==='vertical')spherical.phi=THREE.MathUtils.clamp(spherical.phi+direction*Math.PI/9,.001,Math.PI-.001);
    else spherical.theta+=direction*Math.PI/9;
    homeAt=0;glideTo(target,spherical,{wrap:false,response:.42});
  }
  function view(side){
    // Preserve the assembly/explosion state; frame the strap width for the viewport.
    const radius=Math.max(160,60*camera.zoom/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));const phi=side==='top'?.001:Math.PI-.001;
    homeAt=0;settleUpright();glideTo(framing(),new THREE.Spherical(radius,phi,0));
  }
  // Moving (right/Shift-drag, two fingers) and zooming also ease home once they end.
  controls.addEventListener('start',stopAutoMotion);controls.addEventListener('end',scheduleHome);
  interactionSurface.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;
    event.preventDefault();stopAutoMotion();scheduleHome();const offset=camera.position.clone().sub(controls.target);
    if(event.key==='+'||event.key==='='||event.key==='-'){const distance=THREE.MathUtils.clamp(offset.length()*(event.key==='-'?1.15:1/1.15),controls.minDistance,controls.maxDistance);offset.setLength(distance);camera.position.copy(controls.target).add(offset);}
    else if(event.shiftKey){const move=new THREE.Vector3(event.key==='ArrowLeft'?-5:event.key==='ArrowRight'?5:0,event.key==='ArrowUp'?5:event.key==='ArrowDown'?-5:0,0).applyQuaternion(camera.quaternion);camera.position.add(move);controls.target.add(move);}
    else{const step=Math.PI/12;turn(event.key==='ArrowLeft'?-step:event.key==='ArrowRight'?step:0,event.key==='ArrowUp'?-step:event.key==='ArrowDown'?step:0);}
    controls.update();
  });
  function resize(){const {width,height}=container.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.setViewOffset(width,height,0,height*(camera.aspect<.85?-.05:height<800?.08:.06),width,height);camera.zoom=(camera.aspect<.85?1.1:.8)*Math.min(1,camera.aspect/1.25)*(1-pose().removed*.12-pose().opened*.12);camera.updateProjectionMatrix();renderer.setSize(width,height,false);}
  new ResizeObserver(resize).observe(container);reset(true);resize();select('body');
  const updateMorph=createMorph(scene,camera,assembly,renderer,container,parts);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;},{rootMargin:'100px'}).observe(container);
  renderer.setAnimationLoop(time=>{const dt=Math.min(.05,Math.max(0,(time-lastTime)/1000));lastTime=time;if(!visible||document.hidden)return;
    const before=framing(),previous=amount;
    // A spring drives the two-phase choreography: reversing mid-flight decelerates and turns, never snaps.
    if(reduceMotion.matches){amount=targetPhase;phase.velocity=0;}
    else if(amount!==targetPhase||phase.velocity){phase.value=amount;phase.target=targetPhase;stepSpring(phase,dt,1.05);amount=THREE.MathUtils.clamp(phase.value,0,2);}
    const {removed,opened}=pose();
    // Extract along the grip direction first. Reverse order closes layers before insertion.
    cartridgeAssembly.position.y=removed*55;
    for(const part of Object.values(parts))part.position.z=part.userData.baseZ+part.userData.explodeZ*opened;
    if(amount!==previous){const shift=framing().sub(before);controls.target.add(shift);camera.position.add(shift);camera.zoom=(camera.aspect<.85?1.1:.8)*Math.min(1,camera.aspect/1.25)*(1-removed*.12-opened*.12);camera.updateProjectionMatrix();
      if(glide)for(const axis of ['x','y','z']){glide.springs[axis].value+=shift[axis];glide.springs[axis].target+=shift[axis];}}
    if(glide){
      let moving=false;for(const spring of Object.values(glide.springs))moving=stepSpring(spring,dt,glide.response)||moving;
      const s=glide.springs;controls.target.set(s.x.value,s.y.value,s.z.value);
      camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(s.radius.value,s.phi.value,s.theta.value)));
      if(!moving)glide=null;
    }
    if(homeAt&&!drag&&time>=homeAt)reset(false,HOME_RESPONSE); // slow, critically damped return to the default view
    if(straighten){const moving=stepSpring(straighten.progress,dt,straighten.response);pivot.quaternion.slerpQuaternions(straighten.from,upright,straighten.progress.value);if(!moving)straighten=null;}
    const center=framing();pivot.position.copy(center);pivotOffset.position.copy(center).negate();
    container.dataset.assemblyState=amount===0?'assembled':amount===1?'removed':amount===2?'layers':amount<1?'extracting':'opening';
    controls.update();const morph=updateMorph(time,amount);grid.visible=morph<.45&&camera.position.y>grid.position.y;grid.material.opacity=.12*(1-morph/.45);renderer.render(scene,camera);
  });
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();container.dispatchEvent(new CustomEvent('model-failed',{detail:'The 3D graphics context was interrupted. Original photo shown.'}));});
  return {select,remove(value){exploded=false;targetPhase=value?1:0;},explode(value){exploded=value;targetPhase=value?2:0;},reset,rotate,view,getState(){return {exploded,selected,amount};}};
}
