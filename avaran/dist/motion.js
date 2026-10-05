// Interaction layer: springs, materials and gestures. Presentation only; no evidence is altered.
const $=selector=>document.querySelector(selector);
const all=selector=>[...document.querySelectorAll(selector)];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');

// Apple-style spring: "response" (seconds) and damping ratio, mapped to stiffness/damping with unit mass.
class Spring{
  constructor(value=0,{response=.35,damping=1,precision=.1}={}){this.value=value;this.target=value;this.velocity=0;this.precision=precision;this.configure(response,damping);}
  configure(response,damping){this.k=(2*Math.PI/response)**2;this.c=4*Math.PI*damping/response;return this;}
  to(target,velocity){this.target=target;if(velocity!==undefined)this.velocity=velocity;}
  jump(value){this.value=this.target=value;this.velocity=0;}
  step(dt){
    for(let t=dt;t>0;t-=1/240){const h=Math.min(t,1/240);this.velocity+=(-this.k*(this.value-this.target)-this.c*this.velocity)*h;this.value+=this.velocity*h;}
    if(Math.abs(this.value-this.target)<this.precision&&Math.abs(this.velocity)<this.precision*10){this.value=this.target;this.velocity=0;return false;}
    return true;
  }
}
// One display-synced loop per group of springs; retargeting never restarts it, so motion stays continuous.
class Motion{
  constructor(springs,render){this.springs=springs;this.render=render;this.id=0;this.last=0;this.onRest=null;}
  start(onRest){this.onRest=onRest||null;if(!this.id){this.last=0;this.id=requestAnimationFrame(this.frame);}}
  stop(){cancelAnimationFrame(this.id);this.id=0;}
  frame=time=>{
    const dt=this.last?Math.min((time-this.last)/1000,1/20):1/60;this.last=time;
    let moving=false;for(const spring of this.springs)moving=spring.step(dt)||moving;
    this.render();
    if(moving){this.id=requestAnimationFrame(this.frame);return;}
    this.id=0;const done=this.onRest;this.onRest=null;done?.();
  };
}
// Short pointer history for release velocity (px/s).
function velocityTracker(){
  let points=[];
  return{reset(){points=[];},add(x,y,t){points.push({x,y,t});while(points.length>2&&t-points[0].t>100)points.shift();},
    velocity(){if(points.length<2)return{x:0,y:0};const a=points[0],b=points.at(-1),dt=(b.t-a.t)/1000;return dt>0?{x:(b.x-a.x)/dt,y:(b.y-a.y)/dt}:{x:0,y:0};}};
}
// Where a flick would come to rest (scroll-style exponential deceleration).
const project=(velocity,rate=.998)=>velocity/1000*rate/(1-rate);
const rubberband=(overshoot,dimension,constant=.55)=>Math.sign(overshoot)*(Math.abs(overshoot)*dimension*constant)/(dimension+constant*Math.abs(overshoot));

// iOS Safari only applies :active press states when a touch listener exists.
document.addEventListener('touchstart',()=>{},{passive:true});

// Translucent header: a soft scroll-edge shadow appears only once content passes beneath it.
const header=$('.header');
if(header){const update=()=>header.classList.toggle('is-scrolled',scrollY>2);addEventListener('scroll',update,{passive:true});update();}

// Segmented controls: one selection indicator glides between options on X/Y/size springs.
function segmented(container,itemSelector,isActive,response=.34){
  if(!container)return;
  container.classList.add('seg');
  const indicator=document.createElement('span');indicator.className='seg-indicator';indicator.setAttribute('aria-hidden','true');container.prepend(indicator);
  const springs=[0,0,0,0].map(()=>new Spring(0,{response,damping:1,precision:.05}));const [sx,sy,sw,sh]=springs;let shown=false;
  const motion=new Motion(springs,()=>{indicator.style.transform=`translate(${sx.value}px,${sy.value}px)`;indicator.style.width=`${sw.value}px`;indicator.style.height=`${sh.value}px`;});
  function place(animate){
    const active=[...container.querySelectorAll(itemSelector)].find(item=>isActive(item)&&item.offsetParent);
    if(!active){indicator.style.opacity='0';shown=false;return;}
    const box=[active.offsetLeft,active.offsetTop,active.offsetWidth,active.offsetHeight];
    if(animate&&shown&&!reduceMotion.matches){springs.forEach((spring,i)=>spring.to(box[i]));motion.start();}
    else{motion.stop();springs.forEach((spring,i)=>spring.jump(box[i]));motion.render();}
    indicator.style.opacity='1';shown=true;
    if(!container.classList.contains('seg-ready'))container.classList.add('seg-ready');
  }
  // Mutation records arrive batched before the next paint, so the indicator moves in the same frame as the press.
  new MutationObserver(()=>place(true))
    .observe(container,{subtree:true,attributes:true,attributeFilter:['aria-pressed','aria-current','class','hidden']});
  new ResizeObserver(()=>place(false)).observe(container);
  place(false);
}
const pressed=item=>item.getAttribute('aria-pressed')==='true';
segmented($('.header nav'),'a',item=>item.classList.contains('active'),.42);
segmented($('#part-list'),'button',pressed);
segmented($('.trial-options'),'button',pressed);
all('.view-tabs').forEach(tabs=>segmented(tabs,'button',pressed));
segmented($('.lab-parts'),'button',pressed);
segmented($('.trace-options'),'button',pressed);
segmented($('#tour-chapters'),'button',item=>item.getAttribute('aria-current')==='step');

// Content swaps cross-fade in place instead of popping.
function fadeIn(element){
  if(!element.animate)return;
  element.animate(reduceMotion.matches?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:reduceMotion.matches?160:360,easing:'cubic-bezier(.22,1,.36,1)'});
}
for(const selector of ['#part-detail','#lab-detail','#app-view-title','#app-view-description','#trial-gallery','#trial-observation','#chart-wrap']){
  const element=$(selector);if(element)new MutationObserver(()=>fadeIn(element)).observe(element,{childList:true});
}
for(const image of all('#chamber-photo,#app-screenshot')){
  new MutationObserver(()=>{image.style.opacity='0';}).observe(image,{attributes:true,attributeFilter:['src']});
  image.addEventListener('load',()=>{if(image.style.opacity!=='0')return;image.style.opacity='';fadeIn(image);});
  image.addEventListener('error',()=>{image.style.opacity='';});
}

// Scroll reveals for content below the first screen. Anything already visible is never hidden.
if(!reduceMotion.matches&&'IntersectionObserver' in window){
  const groups=['.fact-strip>div','.section-title','.trial-metadata','.evidence-reading','.material-media','.material-story','.lab-layout','.replay-card','.recording-notes','.app-preview','.pipeline-story','.status-grid>article','.next-validation','.team-row>div'];
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target);}},{rootMargin:'0px 0px -8% 0px'});
  for(const selector of groups){
    all(selector).forEach(element=>{
      if(element.getBoundingClientRect().top<innerHeight)return;
      const order=[...element.parentElement.children].indexOf(element);
      element.classList.add('reveal');element.style.setProperty('--stagger',`${Math.min(order,5)*70}ms`);observer.observe(element);
    });
  }
}

// Timeline track fills to the playhead, matching a native media scrubber.
const timeline=$('#replay-timeline');
if(timeline){
  const paint=()=>{const max=Number(timeline.max)||1;timeline.style.setProperty('--p',`${Math.min(100,Number(timeline.value)/max*100)}%`);};
  const native=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
  Object.defineProperty(timeline,'value',{configurable:true,get(){return native.get.call(this);},set(value){native.set.call(this,value);paint();}});
  timeline.addEventListener('input',paint);paint();
}

// Enlarged images zoom out of the thumbnail that opened them, and can be flicked away.
function imageViewer(){
  const dialog=$('#image-dialog'),image=$('#large-image');if(!dialog||!image)return;
  let source=null,hiddenThumb=null,closing=false,pointer=null,engaged=false,start={x:0,y:0},base={x:0,y:0};
  const tx=new Spring(0,{precision:.2}),ty=new Spring(0,{precision:.2}),scale=new Spring(1,{precision:.0005}),chrome=new Spring(1,{response:.3,precision:.002});
  const motion=new Motion([tx,ty,scale,chrome],render);const track=velocityTracker();
  image.draggable=false;
  function render(){image.style.transform=`translate(${tx.value}px,${ty.value}px) scale(${scale.value})`;dialog.style.setProperty('--chrome',Math.max(0,Math.min(1,chrome.value)).toFixed(3));}
  function tune(response,damping){tx.configure(response,damping);ty.configure(response,damping);scale.configure(response,damping);}
  // The visible picture inside an object-fit: contain box.
  function fitted(element,natural){
    const rect=element.getBoundingClientRect(),style=getComputedStyle(element);
    const left=rect.left+parseFloat(style.paddingLeft)+parseFloat(style.borderLeftWidth),top=rect.top+parseFloat(style.paddingTop)+parseFloat(style.borderTopWidth);
    const width=element.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),height=element.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
    const ratio=Math.min(width/natural.width,height/natural.height);const w=natural.width*ratio,h=natural.height*ratio;
    return{left:left+(width-w)/2,top:top+(height-h)/2,width:w,height:h,element:rect};
  }
  const naturalSize=()=>({width:image.naturalWidth,height:image.naturalHeight});
  function thumbnail(){const thumb=source?.querySelector('img');if(!thumb||!thumb.isConnected)return null;const rect=thumb.getBoundingClientRect();return rect.width&&rect.bottom>0&&rect.top<innerHeight?thumb:null;}
  // Rest geometry of the enlarged picture, measured without the live transform.
  function restGeometry(){const live=image.style.transform;image.style.transform='none';const rest=fitted(image,naturalSize());image.style.transform=live;image.style.transformOrigin=`${rest.left-rest.element.left}px ${rest.top-rest.element.top}px`;return rest;}
  function cleanup(){
    motion.stop();closing=false;pointer=null;engaged=false;
    dialog.classList.remove('is-zooming','is-dragging');image.style.transform='';image.style.transformOrigin='';image.style.opacity='';dialog.style.removeProperty('--chrome');
    if(hiddenThumb){hiddenThumb.style.visibility='';hiddenThumb=null;}
  }
  document.addEventListener('click',event=>{const button=event.target.closest('.image-open');if(button)source=button;},true);
  async function opened(){
    cleanup();
    if(reduceMotion.matches){dialog.classList.remove('js-zoom');return;}
    dialog.classList.add('js-zoom','is-zooming');chrome.jump(0);render();image.style.opacity='0';
    try{await image.decode();}catch{/* Fall back to a material fade below. */}
    if(!dialog.open||closing)return;
    image.style.opacity='';tune(.42,1);chrome.configure(.3,1);
    const thumb=thumbnail();
    if(thumb&&image.naturalWidth){
      const rest=restGeometry(),from=fitted(thumb,{width:thumb.naturalWidth||image.naturalWidth,height:thumb.naturalHeight||image.naturalHeight});
      tx.jump(from.left-rest.left);ty.jump(from.top-rest.top);scale.jump(from.width/rest.width);
      hiddenThumb=thumb;thumb.style.visibility='hidden';
    }else{restGeometry();tx.jump(0);ty.jump(12);scale.jump(.94);}
    render();tx.to(0);ty.to(0);scale.to(1);chrome.to(1);
    motion.start(()=>dialog.classList.remove('is-zooming'));
  }
  function requestClose(velocity={x:0,y:0}){
    if(closing)return;
    if(!dialog.classList.contains('js-zoom')||reduceMotion.matches){dialog.close();return;}
    closing=true;dialog.classList.add('is-zooming');dialog.classList.remove('is-dragging');tune(.4,1);chrome.configure(.26,1);
    const rest=restGeometry(),thumb=hiddenThumb||thumbnail();
    if(thumb&&image.naturalWidth){
      const to=fitted(thumb,{width:thumb.naturalWidth||image.naturalWidth,height:thumb.naturalHeight||image.naturalHeight});
      tx.to(to.left-rest.left,velocity.x);ty.to(to.top-rest.top,velocity.y);scale.to(to.width/rest.width);
    }else{tx.to(tx.value,velocity.x);ty.to(ty.value+Math.sign(velocity.y||1)*24,velocity.y);scale.to(.9);}
    chrome.to(0);
    // Close and restore the thumbnail in the same frame, so the hand-off is seamless.
    motion.start(()=>{dialog.close();cleanup();});
  }
  new MutationObserver(()=>{if(dialog.open)opened();}).observe(dialog,{attributes:true,attributeFilter:['open']});
  dialog.addEventListener('close',cleanup);
  // Route the viewer's own close paths through the reverse zoom.
  dialog.addEventListener('click',event=>{if(event.target.closest('#image-close')||event.target===dialog){event.stopPropagation();requestClose();}},true);
  dialog.addEventListener('cancel',event=>{if(dialog.classList.contains('js-zoom')&&!reduceMotion.matches){event.preventDefault();requestClose();}});
  // Drag to dismiss: 1:1 tracking from the grab point, momentum decides the outcome.
  image.addEventListener('pointerdown',event=>{
    if(closing||!dialog.classList.contains('js-zoom')||(event.pointerType==='mouse'&&event.button!==0))return;
    if(pointer!==null){pointer=null;settle({x:0,y:0});return;}
    pointer=event.pointerId;engaged=false;start={x:event.clientX,y:event.clientY};motion.stop();base={x:tx.value,y:ty.value};track.reset();track.add(event.clientX,event.clientY,event.timeStamp);
  });
  image.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointer)return;
    const dx=event.clientX-start.x,dy=event.clientY-start.y;
    if(!engaged){if(Math.hypot(dx,dy)<10)return;engaged=true;try{image.setPointerCapture(pointer);}catch{/* Pointer already released. */}dialog.classList.add('is-zooming','is-dragging');restGeometry();}
    track.add(event.clientX,event.clientY,event.timeStamp);
    const progress=Math.min(1,Math.abs(base.y+dy)/(innerHeight*.45));
    tx.jump(base.x+dx);ty.jump(base.y+dy);scale.jump(1-progress*.22);chrome.jump(1-progress*.75);render();
  });
  function settle(velocity){tune(.4,.8);chrome.configure(.3,1);tx.to(0,velocity.x);ty.to(0,velocity.y);scale.to(1);chrome.to(1);motion.start(()=>dialog.classList.remove('is-zooming','is-dragging'));}
  function release(event){
    if(event.pointerId!==pointer)return;pointer=null;
    if(!engaged)return;engaged=false;
    const velocity=track.velocity();
    if(event.type==='pointerup'&&Math.abs(ty.value+project(velocity.y))>innerHeight*.22)requestClose(velocity);else settle(velocity);
  }
  image.addEventListener('pointerup',release);image.addEventListener('pointercancel',release);
}
imageViewer();

// The phone tour panel behaves as a sheet: drag the grabber to minimize or expand.
function tourSheet(){
  const tour=$('#tour-dialog'),toggle=$('#tour-minimize');if(!tour||!toggle)return;
  const sheet=matchMedia('(max-width:1000px)');
  const grabber=document.createElement('div');grabber.className='sheet-grabber';grabber.setAttribute('aria-hidden','true');tour.prepend(grabber);
  const y=new Spring(0,{response:.38,damping:1,precision:.2});
  const motion=new Motion([y],()=>{tour.style.transform=y.value?`translateY(${y.value}px)`:'';});
  const track=velocityTracker();let pointer=null,engaged=false,startY=0,base=0,before=null,handoff=0;
  const finish=()=>{tour.classList.remove('is-dragging');tour.style.transform='';};
  // FLIP the height change from Minimize/Expand (button or gesture) so the sheet glides to its new size.
  tour.addEventListener('click',event=>{if(event.target.closest('#tour-minimize')&&sheet.matches&&!reduceMotion.matches)before=tour.getBoundingClientRect().top;},true);
  tour.addEventListener('click',event=>{
    if(before===null||!event.target.closest('#tour-minimize'))return;
    tour.classList.add('is-dragging');motion.stop();tour.style.transform='';
    const after=tour.getBoundingClientRect().top;y.jump(before-after);before=null;
    y.configure(.38,handoff?.85:1);y.to(0,handoff);handoff=0;motion.render();motion.start(finish);
  });
  tour.addEventListener('pointerdown',event=>{
    if(!sheet.matches||!event.target.closest('.sheet-grabber,.tour-top')||event.target.closest('button')||(event.pointerType==='mouse'&&event.button!==0))return;
    pointer=event.pointerId;engaged=false;startY=event.clientY;motion.stop();base=y.value;track.reset();track.add(0,event.clientY,event.timeStamp);
  });
  tour.addEventListener('pointermove',event=>{
    if(event.pointerId!==pointer)return;
    const dy=event.clientY-startY;
    if(!engaged){if(Math.abs(dy)<8)return;engaged=true;try{tour.setPointerCapture(pointer);}catch{/* Pointer already released. */}tour.classList.add('is-dragging');}
    track.add(0,event.clientY,event.timeStamp);
    const minimized=tour.classList.contains('minimized'),travel=base+dy,height=tour.offsetHeight;
    // Free travel toward the other state; progressive resistance past it.
    const value=minimized?(travel<0?Math.max(travel,-140)+rubberband(Math.min(0,travel+140),height):rubberband(travel,height)):(travel>0?travel:rubberband(travel,height));
    y.jump(value);motion.render();
  });
  function release(event){
    if(event.pointerId!==pointer)return;pointer=null;
    if(!engaged)return;engaged=false;
    const velocity=track.velocity().y,landing=y.value+project(velocity),minimized=tour.classList.contains('minimized');
    if(event.type==='pointerup'&&(minimized?landing<-50:landing>tour.offsetHeight*.3)){before=tour.getBoundingClientRect().top;handoff=velocity;toggle.click();return;}
    y.configure(.38,.85);y.to(0,velocity);motion.start(finish);
  }
  tour.addEventListener('pointerup',release);tour.addEventListener('pointercancel',release);
}
tourSheet();
