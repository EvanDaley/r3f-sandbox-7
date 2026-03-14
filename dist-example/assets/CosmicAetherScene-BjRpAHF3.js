import{V as x,S as I,B as G,e as F,M as z,b0 as B,r as i,u as j,f as N,_ as U,j as e,b1 as E,h as M,b2 as v,b3 as K}from"./index-C44cq49d.js";import{v as H}from"./constants-DnExDpUb.js";import{S as O}from"./Stars-BZdBAR_s.js";import{H as L}from"./Html-CBpTYFmV.js";import{P as V}from"./PointerLockControls-D5sfPf-X.js";import"./constants-BiOnIqbL.js";import"./EventDispatcher-FdowiOwe.js";var $=Object.defineProperty,W=(n,t,o)=>t in n?$(n,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):n[t]=o,A=(n,t,o)=>(W(n,typeof t!="symbol"?t+"":t,o),o);const Y=(()=>{const n={uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new x},up:{value:new x(0,1,0)}},vertexShader:`
      uniform vec3 sunPosition;
      uniform float rayleigh;
      uniform float turbidity;
      uniform float mieCoefficient;
      uniform vec3 up;

      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      // constants for atmospheric scattering
      const float e = 2.71828182845904523536028747135266249775724709369995957;
      const float pi = 3.141592653589793238462643383279502884197169;

      // wavelength of used primaries, according to preetham
      const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
      // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
      const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

      // mie stuff
      // K coefficient for the primaries
      const float v = 4.0;
      const vec3 K = vec3( 0.686, 0.678, 0.666 );
      // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
      const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

      // earth shadow hack
      // cutoffAngle = pi / 1.95;
      const float cutoffAngle = 1.6110731556870734;
      const float steepness = 1.5;
      const float EE = 1000.0;

      float sunIntensity( float zenithAngleCos ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
      }

      vec3 totalMie( float T ) {
        float c = ( 0.2 * T ) * 10E-18;
        return 0.434 * c * MieConst;
      }

      void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position.z = gl_Position.w; // set z to camera.far

        vSunDirection = normalize( sunPosition );

        vSunE = sunIntensity( dot( vSunDirection, up ) );

        vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

        float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

      // extinction (absorbtion + out scattering)
      // rayleigh coefficients
        vBetaR = totalRayleigh * rayleighCoefficient;

      // mie coefficients
        vBetaM = totalMie( turbidity ) * mieCoefficient;

      }
    `,fragmentShader:`
      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      uniform float mieDirectionalG;
      uniform vec3 up;

      const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

      // constants for atmospheric scattering
      const float pi = 3.141592653589793238462643383279502884197169;

      const float n = 1.0003; // refractive index of air
      const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

      // optical length at zenith for molecules
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;
      // 66 arc seconds -> degrees, and the cosine of that
      const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

      // 3.0 / ( 16.0 * pi )
      const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
      // 1.0 / ( 4.0 * pi )
      const float ONE_OVER_FOURPI = 0.07957747154594767;

      float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
      }

      float hgPhase( float cosTheta, float g ) {
        float g2 = pow( g, 2.0 );
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
        return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
      }

      void main() {

        vec3 direction = normalize( vWorldPosition - cameraPos );

      // optical length
      // cutoff angle at 90 to avoid singularity in next formula.
        float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;

      // combined extinction factor
        vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

      // in scattering
        float cosTheta = dot( direction, vSunDirection );

        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;

        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;

        vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

      // nightsky
        float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
        float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
        vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
        vec3 L0 = vec3( 0.1 ) * Fex;

      // composition + solar disc
        float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
        L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

        vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

        vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

        gl_FragColor = vec4( retColor, 1.0 );

      #include <tonemapping_fragment>
      #include <${H>=154?"colorspace_fragment":"encodings_fragment"}>

      }
    `},t=new I({name:"SkyShader",fragmentShader:n.fragmentShader,vertexShader:n.vertexShader,uniforms:F.clone(n.uniforms),side:G,depthWrite:!1});class o extends z{constructor(){super(new B(1,1,1),t)}}return A(o,"SkyShader",n),A(o,"material",t),o})(),P=i.forwardRef(({children:n,enabled:t=!0,speed:o=1,rotationIntensity:s=1,floatIntensity:m=1,floatingRange:d=[-.1,.1],autoInvalidate:a=!1,...f},h)=>{const l=i.useRef(null);i.useImperativeHandle(h,()=>l.current,[]);const u=i.useRef(Math.random()*1e4);return j(p=>{var g,c;if(!t||o===0)return;a&&p.invalidate();const r=u.current+p.clock.elapsedTime;l.current.rotation.x=Math.cos(r/4*o)/8*s,l.current.rotation.y=Math.sin(r/4*o)/8*s,l.current.rotation.z=Math.sin(r/4*o)/20*s;let y=Math.sin(r/4*o)/10;y=N.mapLinear(y,-.1,.1,(g=d?.[0])!==null&&g!==void 0?g:-.1,(c=d?.[1])!==null&&c!==void 0?c:.1),l.current.position.y=y*m,l.current.updateMatrix()}),i.createElement("group",f,i.createElement("group",{ref:l,matrixAutoUpdate:!1},n))});function Z(n,t,o=new x){const s=Math.PI*(n-.5),m=2*Math.PI*(t-.5);return o.x=Math.cos(m),o.y=Math.sin(s),o.z=Math.sin(m),o}const q=i.forwardRef(({inclination:n=.6,azimuth:t=.1,distance:o=1e3,mieCoefficient:s=.005,mieDirectionalG:m=.8,rayleigh:d=.5,turbidity:a=10,sunPosition:f=Z(n,t),...h},l)=>{const u=i.useMemo(()=>new x().setScalar(o),[o]),[p]=i.useState(()=>new Y);return i.createElement("primitive",U({object:p,ref:l,"material-uniforms-mieCoefficient-value":s,"material-uniforms-mieDirectionalG-value":m,"material-uniforms-rayleigh-value":d,"material-uniforms-sunPosition-value":f,"material-uniforms-turbidity-value":a,scale:u},h))});function Q({fogDensity:n=.03,accent:t="#f6edd6"}){return e.jsxs(e.Fragment,{children:[e.jsx("color",{attach:"background",args:["#f9f9ff"]}),e.jsx("fogExp2",{attach:"fog",args:["#f9f9ff",n]}),e.jsx("ambientLight",{intensity:1.5,color:"#ffffff"}),e.jsx("directionalLight",{position:[20,35,12],intensity:1.1,color:"#fffbe8",castShadow:!0}),e.jsx("pointLight",{position:[0,9,0],intensity:1.5,color:t}),e.jsx(q,{sunPosition:[2,1.1,8],turbidity:1.2,rayleigh:.6,mieCoefficient:.003,mieDirectionalG:.95}),e.jsx(O,{radius:220,depth:80,count:800,factor:2,saturation:.1,fade:!0,speed:.1}),e.jsxs("mesh",{rotation:[-Math.PI/2,0,0],receiveShadow:!0,position:[0,-.02,0],children:[e.jsx("circleGeometry",{args:[85,96]}),e.jsx("meshStandardMaterial",{color:"#f7f7f3",roughness:.82,metalness:.04})]})]})}function S({position:n,resource:t,color:o="#d6f7ff",amount:s=1}){const m=E(c=>c.gatherResource),d=E(c=>c.setMessage),[a,f]=i.useState(!1),{camera:h}=M(),[l,u]=i.useState(!1),p=i.useMemo(()=>new x(...n),[n]),g=i.useRef(!1);return j(()=>{u(h.position.distanceTo(p)<8)}),i.useEffect(()=>{const c=y=>{y.code!=="KeyF"||g.current||!l||a||(g.current=!0,m(t,s),d(`Gathered ${s} ${t}.`),f(!0),window.setTimeout(()=>f(!1),8e3))},r=y=>{y.code==="KeyF"&&(g.current=!1)};return window.addEventListener("keydown",c),window.addEventListener("keyup",r),()=>{window.removeEventListener("keydown",c),window.removeEventListener("keyup",r)}},[l,a,m,t,s,d]),e.jsxs("group",{position:n,children:[e.jsx(P,{speed:1,rotationIntensity:.6,children:e.jsxs("mesh",{castShadow:!0,children:[e.jsx("icosahedronGeometry",{args:[a?1:3,1]}),e.jsx("meshStandardMaterial",{color:a?"#d8d8d8":o,emissive:a?"#000000":o,emissiveIntensity:a?0:.5})]})}),l&&!a&&e.jsx(L,{position:[0,4,0],center:!0,children:e.jsxs("div",{style:b,children:["Press F — Gather ",t]})})]})}function _({position:n,unlockKey:t,label:o,requiredCost:s,onUnlock:m}){const d=E(r=>r.spendResources),a=E(r=>r.unlockTech),f=E(r=>r.setMessage),h=E(r=>r.unlocks),{camera:l}=M(),[u,p]=i.useState(!1),g=i.useMemo(()=>new x(...n),[n]),c=i.useRef(!1);return j(()=>{p(l.position.distanceTo(g)<4.5)}),i.useEffect(()=>{const r=R=>{if(R.code!=="KeyF"||c.current||!u)return;if(c.current=!0,h[t]){f(`${o} already unlocked.`);return}if(!d(s)){f(`Need ${Object.entries(s).map(([C,D])=>`${C} x${D}`).join(", ")}.`);return}a(t),f(`${o} unlocked. New route attuned.`),m?.()},y=R=>{R.code==="KeyF"&&(c.current=!1)};return window.addEventListener("keydown",r),window.addEventListener("keyup",y),()=>{window.removeEventListener("keydown",r),window.removeEventListener("keyup",y)}},[u,o,m,s,f,d,t,a,h]),e.jsxs("group",{position:n,children:[e.jsxs("mesh",{castShadow:!0,children:[e.jsx("cylinderGeometry",{args:[.9,1.2,3.4,18]}),e.jsx("meshStandardMaterial",{color:"#f2f0fb",metalness:.35,roughness:.42,emissive:"#cbd4ff",emissiveIntensity:.18})]}),e.jsxs("mesh",{position:[0,2.1,0],children:[e.jsx("torusGeometry",{args:[.85,.12,16,32]}),e.jsx("meshStandardMaterial",{color:"#f4dd9a",emissive:"#f4dd9a",emissiveIntensity:.35})]}),u&&e.jsx(L,{position:[0,2.9,0],center:!0,children:e.jsxs("div",{style:b,children:["Press F — ",o]})})]})}const b={color:"#2d334a",background:"rgba(255,255,255,0.82)",border:"1px solid rgba(96,102,138,0.4)",borderRadius:8,padding:"6px 8px",fontSize:12,fontWeight:600,whiteSpace:"nowrap"};function X(){return e.jsxs("group",{children:[e.jsxs("mesh",{position:[0,.8,0],children:[e.jsx("cylinderGeometry",{args:[16,18,1.6,40]}),e.jsx("meshStandardMaterial",{color:"#f7f5f8",roughness:.7,metalness:.2})]}),e.jsxs("mesh",{position:[0,6,-10],rotation:[.1,0,0],children:[e.jsx("torusGeometry",{args:[8,.45,24,80]}),e.jsx("meshStandardMaterial",{color:"#f6dfad",emissive:"#f6dfad",emissiveIntensity:.3})]}),[[-7,4.8,-4],[7,5.2,-3],[0,5.6,4]].map((n,t)=>e.jsx(P,{speed:.4+t*.15,rotationIntensity:.35,children:e.jsxs("mesh",{position:n,children:[e.jsx("boxGeometry",{args:[2.2,8.4,2.2]}),e.jsx("meshStandardMaterial",{color:"#f0edff",metalness:.25,roughness:.45})]})},t)),e.jsx(S,{position:[-5,1.7,8],resource:v.AETHER_PEARL,color:"#e7d1ff",amount:1}),e.jsx(S,{position:[6,1.8,6],resource:v.LUMEN_SHARD,color:"#caecff",amount:2}),e.jsx(S,{position:[2,1.7,-6],resource:v.VEIL_FIBER,color:"#d7fff6",amount:2})]})}function J(){return e.jsxs("group",{children:[e.jsxs("mesh",{position:[0,.7,0],children:[e.jsx("cylinderGeometry",{args:[12,14,1.4,36]}),e.jsx("meshStandardMaterial",{color:"#f4f7f2",roughness:.75,metalness:.08})]}),[[-10,3.8,-4],[9,4.2,-8],[8,3.4,9]].map((n,t)=>e.jsx(P,{speed:.7+t*.2,children:e.jsxs("mesh",{position:n,children:[e.jsx("sphereGeometry",{args:[1.6,18,18]}),e.jsx("meshStandardMaterial",{color:"#ffffff",emissive:"#d5fff9",emissiveIntensity:.15})]})},t)),e.jsx(S,{position:[-8,1.4,1],resource:v.LUMEN_SHARD,color:"#d5f1ff",amount:2}),e.jsx(S,{position:[6,1.7,5],resource:v.LUMEN_SHARD,color:"#caf4ff",amount:2}),e.jsx(S,{position:[1.5,1.4,-7],resource:v.AETHER_PEARL,color:"#efd9ff",amount:1}),e.jsx(_,{position:[0,1.8,10],unlockKey:"choirRuinsAccess",label:"Attune Choir Ruins Route",requiredCost:{[v.LUMEN_SHARD]:4,[v.AETHER_PEARL]:1}})]})}function k(){return e.jsxs("group",{children:[e.jsxs("mesh",{position:[0,1.2,0],children:[e.jsx("cylinderGeometry",{args:[6.5,8.2,2.4,32]}),e.jsx("meshStandardMaterial",{color:"#f5f5f8",metalness:.15,roughness:.6})]}),e.jsxs("mesh",{position:[0,3.2,-5],children:[e.jsx("torusGeometry",{args:[5.2,.3,24,64]}),e.jsx("meshStandardMaterial",{color:"#fff4c8",emissive:"#f9ebbe",emissiveIntensity:.4})]}),e.jsx(S,{position:[-6,1.2,-3],resource:v.PALE_DUST,color:"#fef6d8",amount:2}),e.jsx(S,{position:[5,1.4,-5],resource:v.PALE_DUST,color:"#fff6df",amount:2}),e.jsx(S,{position:[-4,1.3,6],resource:v.PALE_DUST,color:"#fff4d0",amount:2}),e.jsx(S,{position:[3,1.6,7],resource:v.VEIL_FIBER,color:"#dbf6f4",amount:1}),e.jsx(_,{position:[0,1.8,8],unlockKey:"paleGardenAccess",label:"Attune Pale Garden Route",requiredCost:{[v.PALE_DUST]:4,[v.VEIL_FIBER]:2}})]})}function ee({safeRadius:n=18,spawn:t=[0,3,10]}){const{camera:o}=M(),s=E(f=>f.drainAether),m=E(f=>f.setMessage),d=E(f=>f.refillAether),a=i.useMemo(()=>new x(0,2,0),[]);return j((f,h)=>{const l=o.position.distanceTo(a),u=E.getState().aether;if(l>n){const p=Math.min(2.4,l/n);s(h*6*p)}u<=0&&(o.position.set(...t),d(),m("Aether depleted. Rescue recall triggered to your current sanctuary."))}),null}const w={forward:["KeyW","ArrowUp"],backward:["KeyS","ArrowDown"],left:["KeyA","ArrowLeft"],right:["KeyD","ArrowRight"],up:["Space","KeyE"],down:["ShiftLeft","KeyQ"],glide:["ShiftRight"]};function te({speed:n=9,floatDrag:t=.9,bounds:o=65}){const{camera:s,gl:m}=M(),d=i.useRef(new x),a=i.useRef({}),f=i.useMemo(()=>({forward:new x,right:new x,worldUp:new x(0,1,0),movement:new x}),[]);return i.useEffect(()=>{const h=()=>{};return document.addEventListener("pointerlockerror",h),()=>{document.removeEventListener("pointerlockerror",h),document.pointerLockElement===m.domElement&&document.exitPointerLock().catch(()=>{})}},[m.domElement]),i.useEffect(()=>{const h=p=>g=>{a.current[g.code]=p},l=h(!0),u=h(!1);return window.addEventListener("keydown",l),window.addEventListener("keyup",u),()=>{window.removeEventListener("keydown",l),window.removeEventListener("keyup",u)}},[]),j((h,l)=>{const{forward:u,right:p,worldUp:g,movement:c}=f;if(u.set(0,0,-1).applyQuaternion(s.quaternion).setY(0).normalize(),p.crossVectors(u,g).normalize(),c.set(0,0,0),w.forward.some(r=>a.current[r])&&c.add(u),w.backward.some(r=>a.current[r])&&c.sub(u),w.left.some(r=>a.current[r])&&c.sub(p),w.right.some(r=>a.current[r])&&c.add(p),w.up.some(r=>a.current[r])&&(c.y+=1),w.down.some(r=>a.current[r])&&(c.y-=1),c.lengthSq()>0){c.normalize();const r=w.glide.some(y=>a.current[y])?1.35:1;d.current.addScaledVector(c,n*r*l)}d.current.multiplyScalar(t),s.position.addScaledVector(d.current,l*60),s.position.x=Math.max(-o,Math.min(o,s.position.x)),s.position.y=Math.max(1.5,Math.min(45,s.position.y)),s.position.z=Math.max(-o,Math.min(o,s.position.z))}),e.jsx(V,{})}const oe={sanctuaryHalo:k,paleGarden:J,choirRuins:X},T=[0,3,10];function ne(){const n=E(o=>o.currentStageId),{camera:t}=M();return i.useEffect(()=>{t.position.set(...T),t.lookAt(0,3,0)},[t,n]),null}function de(){const n=E(s=>s.currentStageId),t=K[n],o=oe[n]??k;return e.jsxs(e.Fragment,{children:[e.jsx(ne,{}),e.jsx(Q,{fogDensity:t.fogDensity,accent:t.accent}),e.jsx(o,{}),e.jsx(te,{}),e.jsx(ee,{spawn:T})]})}export{de as default};
