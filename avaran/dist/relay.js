// Page intro retained; the prototype owns the continuous DNA stream now.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const overlay=document.querySelector('#page-intro');
function finish(){try{sessionStorage.setItem('avaran-intro','seen');}catch{}window.avaranIntroDone?.();overlay?.remove();}
if(!overlay||!document.documentElement.classList.contains('intro-on')||reduced.matches)finish();
else {
  const start=performance.now(),count=document.querySelector('#intro-count'),arc=document.querySelector('.intro-arc');
  function frame(now){
    const p=Math.min(1,(now-start)/1000);count.textContent=String(Math.round(p*100)).padStart(2,'0');arc.style.strokeDashoffset=String(100-p*100);
    if(p<1){requestAnimationFrame(frame);return;}
    const ring=document.querySelector('.intro-ring'),logo=document.querySelector('.brand-symbol');
    const from=ring.getBoundingClientRect(),to=logo.getBoundingClientRect();
    overlay.animate([{opacity:1},{opacity:0}],{duration:600,fill:'forwards'});
    ring.animate([{transform:'none'},{transform:`translate(${to.left+to.width/2-from.left-from.width/2}px,${to.top+to.height/2-from.top-from.height/2}px) scale(${to.width/from.width})`}],{duration:600,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'}).finished.then(finish);
  }
  requestAnimationFrame(frame);
}
