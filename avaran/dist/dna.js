import * as THREE from 'three';
import { installSurfaceErosion, ashVertexShader, ashFragmentShader } from './ash.js';
import { createHelixSamples } from './helix.js';

// Original point artwork. Model surface samples become the decorative double helix.
export function createMorph(scene, camera, assembly, renderer, container, parts) {
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pause=document.querySelector('#flow-pause');let paused=reduced.matches,motionTime=0,previousTime=0;
  const syncPause=()=>{pause.textContent=paused?'Resume motion':'Pause motion';pause.setAttribute('aria-pressed',String(paused));};
  pause.addEventListener('click',()=>{paused=!paused;syncPause();});reduced.addEventListener('change',()=>{paused=reduced.matches;syncPause();});syncPause();
  const hero=document.querySelector('.prototype-hero'),sticky=document.querySelector('.hero-sticky');
  const svg=document.querySelector('#part-leaders');
  const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  let seed=4812;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const meshes=[];assembly.traverse(o=>{if(o.isMesh)meshes.push(o);});
  const samplePoints=[],sampleNormals=[],sampleColors=[],sampleMeshes=[],vA=new THREE.Vector3(),vB=new THREE.Vector3(),vC=new THREE.Vector3();
  // Area-weighted sampling respects the supplied mesh geometry, including cut-outs.
  const surfaces=meshes.map(mesh=>{
    const g=mesh.geometry,p=g.attributes.position,index=g.index,total=(index?index.count:p.count)/3,cdf=[];let area=0;
    for(let t=0;t<total;t++){
      const i=n=>index?index.getX(t*3+n):t*3+n;
      vA.fromBufferAttribute(p,i(0));vB.fromBufferAttribute(p,i(1));vC.fromBufferAttribute(p,i(2));
      area+=vB.sub(vA).cross(vC.sub(vA)).length()/2;cdf.push(area);
    }
    const palette={body:'#52647e',cartridge:'#3e4d61',backing:'#e5e8e0',sensing:'#e9df91',reference:'#e9df91',cover:'#94a3a0',optics:'#deded8'};
    // Palette values describe the lit surfaces, so retain their display-space channel values.
    const color=new THREE.Color(palette[mesh.userData.part]||'#354253').convertLinearToSRGB();
    const image=mesh.material.map?.image;
    const pixels=image?.getContext?.('2d')?.getImageData(0,0,image.width,image.height);
    return {mesh,p,index,cdf,area,color,pixels,uv:g.attributes.uv};
  });
  const area=surfaces.reduce((sum,s)=>sum+s.area,0),budget=innerWidth<700?76000:156000;
  for(const s of surfaces){
    const n=Math.max(230,Math.round(budget*s.area/area));
    for(let k=0;k<n;k++){
      const pick=random()*s.area;let lo=0,hi=s.cdf.length-1;
      while(lo<hi){const mid=(lo+hi)>>1;if(s.cdf[mid]<pick)lo=mid+1;else hi=mid;}
      const i=n=>s.index?s.index.getX(lo*3+n):lo*3+n;
      vA.fromBufferAttribute(s.p,i(0));vB.fromBufferAttribute(s.p,i(1));vC.fromBufferAttribute(s.p,i(2));
      const u=Math.sqrt(random()),v=random();
      samplePoints.push(vA.clone().multiplyScalar(1-u).addScaledVector(vB,u*(1-v)).addScaledVector(vC,u*v));sampleMeshes.push(s.mesh);
      sampleNormals.push(vB.clone().sub(vA).cross(vC.clone().sub(vA)).normalize());
      const color=s.color.clone();
      if(s.pixels&&s.uv){
        const x=s.uv.getX(i(0))*(1-u)+s.uv.getX(i(1))*u*(1-v)+s.uv.getX(i(2))*u*v;
        const y=s.uv.getY(i(0))*(1-u)+s.uv.getY(i(1))*u*(1-v)+s.uv.getY(i(2))*u*v;
        const px=Math.min(s.pixels.width-1,Math.max(0,Math.floor(x*s.pixels.width))),py=Math.min(s.pixels.height-1,Math.max(0,Math.floor((1-y)*s.pixels.height)));
        const offset=(py*s.pixels.width+px)*4;const data=s.pixels.data;
        color.setRGB(data[offset]/255,data[offset+1]/255,data[offset+2]/255);
      }
      sampleColors.push(color);
    }
  }
  const count=samplePoints.length,world=new Float32Array(count*3),colors=new Float32Array(count*3),facing=new Float32Array(count),source=new Float32Array(count*3),seeds=new Float32Array(count);
  const {positions:helix,kinds,tones}=createHelixSamples(count,random);
  for(let i=0;i<count;i++){
    seeds[i]=random();sampleColors[i].toArray(colors,i*3);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(helix,3));geometry.setAttribute('aSource',new THREE.BufferAttribute(source,3));geometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));geometry.setAttribute('aDnaKind',new THREE.BufferAttribute(kinds,1));geometry.setAttribute('aDnaTone',new THREE.BufferAttribute(tones,1));
  geometry.setAttribute('aWorld',new THREE.BufferAttribute(world,3));geometry.setAttribute('aColor',new THREE.BufferAttribute(colors,3));geometry.setAttribute('aFacing',new THREE.BufferAttribute(facing,1));
  for(const name of ['aSource','aWorld','aFacing'])geometry.attributes[name].setUsage(THREE.DynamicDrawUsage);
  const uniforms={uViewProjection:{value:new THREE.Matrix4()},uProgress:{value:0},uTime:{value:0},uAspect:{value:1},uScroll:{value:0},uAlpha:{value:0},uRatio:{value:renderer.getPixelRatio()},uPointer:{value:new THREE.Vector2(8,8)}};
  const material=new THREE.ShaderMaterial({uniforms,transparent:true,depthWrite:false,depthTest:true,blending:THREE.NormalBlending,vertexShader:ashVertexShader,fragmentShader:ashFragmentShader});
  installSurfaceErosion(meshes,uniforms);
  const points=new THREE.Points(geometry,material);points.frustumCulled=false;points.renderOrder=10;scene.add(points);
  let progress=0,targetProgress=0,velocity=0,revealTime=0,firstFrame=true;
  const labels=[...document.querySelectorAll('.part-callout')].map(button=>{
    const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g'),path=document.createElementNS(ns,'path'),dot=document.createElementNS(ns,'circle');dot.setAttribute('r','2.5');group.append(path,dot);svg.append(group);
    return {button,path,dot,group,part:parts[button.dataset.part],anchor:button.dataset.part==='body'?new THREE.Vector3(-18,0,6):button.dataset.part==='cartridge'?new THREE.Vector3(-14,18,5):button.dataset.part==='optics'?new THREE.Vector3(12,13,0):button.dataset.part==='backing'?new THREE.Vector3(-7.5,0,4.72):new THREE.Vector3()};
  });
  const point=new THREE.Vector3(),normal=new THREE.Vector3(),eye=new THREE.Vector3();
  const sampledView=new THREE.Matrix4(),sampledTransforms=new Map(meshes.map(mesh=>[mesh,new THREE.Matrix4()]));let sampled=false;
  let width=innerWidth,height=innerHeight;
  function resize(){width=container.clientWidth;height=container.clientHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);uniforms.uAspect.value=width/height;}
  new ResizeObserver(resize).observe(container);resize();
  addEventListener('pointermove',e=>{if(!paused&&!reduced.matches)uniforms.uPointer.value.set(e.clientX/width*2-1,1-e.clientY/height*2);},{passive:true});
  function scroll(){targetProgress=clamp((scrollY-height*.15)/(height*.88));}
  addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);scroll();
  return function update(time,amount){
    const dt=Math.min(.05,Math.max(0,(time-previousTime)*.001));
    if(firstFrame||reduced.matches){progress=targetProgress;velocity=0;firstFrame=false;}
    else {
      // Analytic critically damped spring: no per-wheel jumps, overshoot or accumulating drift.
      const omega=13,delta=progress-targetProgress,temp=(velocity+omega*delta)*dt,decay=Math.exp(-omega*dt);
      progress=targetProgress+(delta+temp)*decay;velocity=(velocity-omega*temp)*decay;
      if(Math.abs(progress-targetProgress)<.00008&&Math.abs(velocity)<.0008){progress=targetProgress;velocity=0;}
    }
    const p=reduced.matches?(progress>.5?1:0):clamp(progress);
    const flow=p>.003||targetProgress>.003;
    hero.style.setProperty('--hero-opacity',String(1-ease(p/.38)));sticky.inert=p>.38;
    container.dataset.flow=String(flow);container.dataset.morph=p.toFixed(3);pause.hidden=p<.8;
    const input=container.querySelector('.model-input');if(input)input.tabIndex=flow?-1:0;
    // The surface stays opaque until a spatially matched grain leaves it.
    assembly.visible=p<.66;points.visible=p>0;
    if(!paused&&!reduced.matches)motionTime+=dt*1000;previousTime=time;
    uniforms.uProgress.value=p;uniforms.uTime.value=motionTime*.001;
    if(reduced.matches)uniforms.uScroll.value=0;else if(!paused)uniforms.uScroll.value=scrollY;
    uniforms.uAlpha.value=1-.25*ease((scrollY-height*1.75)/height);
    assembly.updateWorldMatrix(true,true);camera.updateMatrixWorld();
    uniforms.uViewProjection.value.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    // Scroll motion runs on the GPU. Resample only when the model or camera actually moves.
    const needsSample=!sampled||!sampledView.equals(uniforms.uViewProjection.value)||meshes.some(mesh=>!sampledTransforms.get(mesh).equals(mesh.matrixWorld));
    if(p>0&&p<1&&needsSample){
      for(let i=0;i<count;i++){
        point.copy(samplePoints[i]).applyMatrix4(sampleMeshes[i].matrixWorld);point.toArray(world,i*3);
        eye.copy(camera.position).sub(point).normalize();normal.copy(sampleNormals[i]).transformDirection(sampleMeshes[i].matrixWorld);facing[i]=normal.dot(eye);
        point.project(camera);point.toArray(source,i*3);
      }
      geometry.attributes.aSource.needsUpdate=true;geometry.attributes.aWorld.needsUpdate=true;geometry.attributes.aFacing.needsUpdate=true;
      sampledView.copy(uniforms.uViewProjection.value);for(const mesh of meshes)sampledTransforms.get(mesh).copy(mesh.matrixWorld);sampled=true;
    }
    if(!revealTime&&amount>1.85)revealTime=time;
    svg.style.opacity=String(1-ease(progress/.28));
    if(progress<.4){
      assembly.updateWorldMatrix(true,true);camera.updateMatrixWorld();
      for(const [index,l] of labels.entries()){
        point.copy(l.anchor);l.part.localToWorld(point);point.project(camera);
        const x=(point.x*.5+.5)*width,y=(.5-point.y*.5)*height;
        const b=l.button.getBoundingClientRect(),right=l.button.classList.contains('right'),ex=right?b.left:b.right,ey=b.top+1,elbow=ex+(right?-22:22);
        const age=revealTime?time-revealTime-index*85:-1000;
        const lineT=reduced.matches?1:ease(age/450),textT=reduced.matches?1:ease((age-200)/350);
        const first=clamp(lineT/.82),last=clamp((lineT-.82)/.18);
        l.path.setAttribute('d',`M${x.toFixed(1)},${y.toFixed(1)} L${(x+(elbow-x)*first).toFixed(1)},${(y+(ey-y)*first).toFixed(1)}${first===1?' L'+(elbow+(ex-elbow)*last).toFixed(1)+','+ey.toFixed(1):''}`);
        l.dot.style.opacity=String(lineT);l.button.style.opacity=String(textT);l.button.style.transform=`translateY(${(1-textT)*8}px)`;
        l.dot.setAttribute('cx',x);l.dot.setAttribute('cy',y);l.group.dataset.selected=l.button.getAttribute('aria-pressed');
      }
    }
    return progress;
  };
}
