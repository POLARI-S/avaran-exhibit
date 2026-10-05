// Two continuous helical backbones, with discrete base-pair rungs between them.
// Tube-local sampling keeps the central ladder clear while soft plumes leave its edges.
export function createHelixSamples(count,random) {
  const positions=new Float32Array(count*3),kinds=new Float32Array(count),tones=new Float32Array(count);
  const radius=.47,twist=3.9,pitch=.115,extent=2.6,tangentLength=Math.hypot(1,radius*twist);
  const gaussian=()=>Math.sqrt(-2*Math.log(Math.max(.00001,random())))*Math.cos(random()*Math.PI*2);
  for(let i=0;i<count;i++) {
    const choice=random(),rung=choice<.16,plume=choice>.79;
    const y=rung?Math.round((random()*2-1)*extent/pitch)*pitch:(random()*2-1)*extent;
    const theta=y*twist+(rung?0:(random()<.5?0:Math.PI));
    const c=Math.cos(theta),s=Math.sin(theta);
    if(rung) {
      const along=random()*2-1,thickness=.007;
      positions.set([radius*c*along+gaussian()*thickness,y+gaussian()*thickness,radius*s*along+gaussian()*thickness],i*3);
      kinds[i]=1;tones[i]=random();
    } else {
      const around=random()*Math.PI*2;
      const width=plume?.06+random()*.065:.024;
      const spread=Math.min(2.5,Math.abs(gaussian()))*width;
      const radial=Math.cos(around)*spread,binormal=Math.sin(around)*spread;
      const ridge=.009*Math.sin(y*23+Math.sin(y*9)*2);
      positions.set([
        (radius+radial+ridge)*c+binormal*s/tangentLength,
        y+binormal*radius*twist/tangentLength,
        (radius+radial+ridge)*s-binormal*c/tangentLength
      ],i*3);
      kinds[i]=plume?2:0;
      tones[i]=Math.max(0,Math.min(1,.45+.28*Math.sin(y*17+around*1.3)+.22*random()));
    }
  }
  return {positions,kinds,tones};
}
