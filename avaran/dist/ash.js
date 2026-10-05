// A shared erosion field keeps the disappearing surface and its released grains aligned.
// World-space noise follows every layer; the broad sweep moves from upper right to lower left.
export const erosionField = `
  float ashHash(vec3 p) {
    p=fract(p*.1031);p+=dot(p,p.yzx+33.33);
    return fract((p.x+p.y)*p.z);
  }
  float ashNoise(vec3 p) {
    vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
    return mix(mix(mix(ashHash(i),ashHash(i+vec3(1,0,0)),f.x),
                   mix(ashHash(i+vec3(0,1,0)),ashHash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(ashHash(i+vec3(0,0,1)),ashHash(i+vec3(1,0,1)),f.x),
                   mix(ashHash(i+vec3(0,1,1)),ashHash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float ashRelease(vec3 world,vec2 screen) {
    float sweep=clamp(.5-screen.y*.44-screen.x*.2,0.,1.);
    float grain=ashNoise(world*.38)*.64+ashNoise(world*1.4)*.25+ashNoise(world*4.8)*.11;
    return .055+sweep*.39+grain*.18;
  }
`;

export function installSurfaceErosion(meshes, uniforms) {
  for(const material of new Set(meshes.map(mesh=>mesh.material))) {
    material.onBeforeCompile=shader=>{
      shader.uniforms.uAshProgress=uniforms.uProgress;
      shader.uniforms.uAshViewProjection=uniforms.uViewProjection;
      shader.vertexShader=shader.vertexShader.replace('#include <common>',
        '#include <common>\nvarying vec3 vAshWorld;');
      shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\nvAshWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
      shader.fragmentShader=shader.fragmentShader.replace('#include <common>',
        `#include <common>\nvarying vec3 vAshWorld;uniform float uAshProgress;uniform mat4 uAshViewProjection;\n${erosionField}`);
      shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>', `
        vec4 ashClip=uAshViewProjection*vec4(vAshWorld,1.);
        float release=ashRelease(vAshWorld,ashClip.xy/ashClip.w);
        if(uAshProgress>release) discard;
        // A narrow, matte edge reads as crumbling material without adding a glowing outline.
        float edge=smoothstep(release-.027,release,uAshProgress);
        outgoingLight=mix(outgoingLight,outgoingLight*.35+vec3(.055),edge*.7);
        #include <opaque_fragment>
      `);
    };
    material.customProgramCacheKey=()=> 'avaran-surface-erosion-v1';
    material.needsUpdate=true;
  }
}

export const ashVertexShader=`
  attribute vec3 aSource,aWorld,aColor;
  attribute float aSeed,aDnaKind,aDnaTone,aFacing;
  uniform float uProgress,uTime,uAspect,uScroll,uAlpha,uRatio;
  uniform vec2 uPointer;
  varying float vAlpha,vSeed,vGather;
  varying vec3 vColor;
  ${erosionField}
  void main(){
    // Once formed, the helix no longer needs the mesh's three noise octaves.
    float release=uProgress<.9999?ashRelease(aWorld,aSource.xy):0.;
    float age=max(0.,uProgress-release);
    float shed=smoothstep(release-.007,release+.025,uProgress);
    float flight=1.-exp(-age*5.5);
    float gather=smoothstep(.55+aSeed*.055,.985,uProgress);

    // The grain starts exactly on its surface, then curls upwards with a shared soft breeze.
    vec2 wind=vec2(.22+sin(aSeed*31.)*.14,.25+aSeed*.32);
    vec2 curl=vec2(sin(age*9.+aSeed*24.+uTime*.12),cos(age*7.+aSeed*19.+uTime*.1));
    vec2 ash=aSource.xy+wind*flight+curl*flight*(.018+age*.085);
    ash.x+=sin(aSource.y*5.+age*8.)*flight*.07;
    ash.y-=age*age*.16*(1.-aSeed);

    float plume=step(1.5,aDnaKind),rung=step(.5,aDnaKind)*(1.-plume);
    float angle=uTime*.055+uScroll*.00012;
    vec3 p=position;
    // Coherent eddies follow the tube. The ladder stays intact as the outer dust drifts.
    vec3 eddy=vec3(sin(p.y*12.+p.z*7.+uTime*.24),cos(p.x*9.+p.y*7.-uTime*.18),sin(p.y*10.+p.x*8.+uTime*.2));
    p+=eddy*(.005+plume*.025)*(1.-rung*.8);
    float x=p.x*cos(angle)-p.z*sin(angle),z=p.x*sin(angle)+p.z*cos(angle);
    float viewY=p.y*.976-z*.218;
    float tilt=mix(.14,.30,smoothstep(.6,1.3,uAspect));
    float scale=min(1.2,max(.78,uAspect*1.28));
    float perspective=1./(1.-z*.12);
    // Use the same pixel scale on both axes; viewport width must not stretch the helix.
    vec2 target=vec2((x*cos(tilt)+viewY*sin(tilt))/uAspect,viewY*cos(tilt)-x*sin(tilt))*scale*perspective;
    target.x+=mix(.03,.36,smoothstep(.6,1.5,uAspect))+sin(uScroll*.00025)*.035;
    vec2 delta=target-uPointer;
    vec2 metric=delta*vec2(uAspect,1.);
    target+=normalize(metric+vec2(.001))/vec2(uAspect,1.)*exp(-dot(metric,metric)*18.)*(.018+plume*.024);
    vec2 point=mix(ash,target,gather);
    // Preserve occlusion at the surface. Released grains approach the camera gradually.
    float depth=mix(aSource.z-.00004,.1,smoothstep(0.,.14,age));
    gl_Position=vec4(point,mix(depth,0.,gather),1.);
    float dnaSize=(1.15+aSeed*.8+plume*.15)*perspective;
    float size=mix(.75+aSeed*.9,dnaSize,gather);
    gl_PointSize=size*uRatio;
    float front=mix(smoothstep(-.08,.22,aFacing),1.,smoothstep(.02,.17,age));
    float ashAlpha=(.38+aSeed*.34)*shed*front;
    float depthLight=smoothstep(-.5,.5,z);
    float dnaAlpha=(.6+aSeed*.35)*(1.-plume*.48)*(1.-rung*.18)*(1.-smoothstep(2.,2.6,abs(p.y)))*(.7+depthLight*.3);
    vAlpha=uAlpha*mix(ashAlpha,dnaAlpha,gather);
    vec3 ashColor=mix(aColor,vec3(.56,.57,.53),smoothstep(.015,.3,age)*.72);
    vec3 dnaColor=mix(vec3(.27,.48,.35),vec3(.7,.84,.53),aDnaTone);
    dnaColor=mix(dnaColor,vec3(.76,.84,.40),smoothstep(.7,1.,aDnaTone)*.68);
    dnaColor=mix(dnaColor,vec3(.59,.71,.51),rung*.65);
    dnaColor*=.8+depthLight*.2;
    vColor=mix(ashColor,dnaColor,gather);
    vSeed=aSeed;vGather=gather;
  }
`;

export const ashFragmentShader=`
  varying float vAlpha,vSeed,vGather;varying vec3 vColor;
  void main(){
    vec2 q=gl_PointCoord-.5;
    float a=vSeed*6.283,c=cos(a),s=sin(a);
    q=mat2(c,-s,s,c)*q;
    float grain=max(abs(q.x)*(.9+vSeed*.45),abs(q.y)*1.1);
    float edge=mix(grain,length(q),vGather);
    if(edge>.5)discard;
    float opacity=1.-smoothstep(mix(.25,.30,vGather),.5,edge);
    gl_FragColor=vec4(vColor,vAlpha*opacity);
  }
`;
