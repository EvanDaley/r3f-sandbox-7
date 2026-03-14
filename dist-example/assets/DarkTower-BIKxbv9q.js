import{r as c,a4 as S,h as P,u as A,j as t,R as C,V as W,a5 as L,a6 as U,a7 as M,a8 as b,f as F,O as I}from"./index-C44cq49d.js";import{P as B,R as N,C as D}from"./react-three-rapier.esm-CdWonB2o.js";import{K as G,E as K}from"./Ecctrl-BJYz5B1e.js";import{T as O,E as k}from"./TowerDefenseEngine-ZLMjzEFJ.js";import{S as _}from"./Stars-BZdBAR_s.js";import"./BufferGeometryUtils-C3aaLW-c.js";import"./constants-DnExDpUb.js";import"./constants-BiOnIqbL.js";const x=new I,w=new W(0,1.5,-2),E="dark-tower:walls",T="dark-tower:turrets";function q({controllerRef:e}){return t.jsx(K,{springK:2,dampingC:.2,camInitDis:-35,camMaxDis:-80,camCollisionOffset:.3,camInitDir:{x:.7,y:0},camTargetPos:{x:0,y:1.5,z:0},position:w.toArray(),ref:e,children:t.jsxs("mesh",{castShadow:!0,children:[t.jsx("boxGeometry",{args:[.8,.8,.8]}),t.jsx("meshStandardMaterial",{color:"#93c5fd",roughness:.45,metalness:.15,emissive:"#1e293b",emissiveIntensity:.45})]})})}function J({engine:e,structureVersion:v}){const m=c.useRef(),p=c.useMemo(()=>Array.from(e.walls),[e,v]);return c.useLayoutEffect(()=>{const l=m.current;l&&(p.forEach((u,i)=>{const[n,a]=u.split(",").map(Number),r=e.cellToWorld(n,a);x.position.set(r.x,.5,r.z),x.rotation.set(0,0,0),x.updateMatrix(),l.setMatrixAt(i,x.matrix)}),l.count=p.length,l.instanceMatrix.needsUpdate=!0)},[e,p]),t.jsxs("instancedMesh",{ref:m,args:[null,null,e.gridSize*e.gridSize],castShadow:!0,receiveShadow:!0,frustumCulled:!1,children:[t.jsx("boxGeometry",{args:[e.cellSize*.95,1,e.cellSize*.95]}),t.jsx("meshStandardMaterial",{color:"#111827",roughness:.95,metalness:.03,emissive:"#020617",emissiveIntensity:.2})]})}function V({engine:e,structureVersion:v}){const m=c.useRef(),p=c.useRef(),l=c.useMemo(()=>Array.from(e.turrets),[e,v]);return c.useLayoutEffect(()=>{const u=m.current,i=p.current;!u||!i||(l.forEach((n,a)=>{const[r,o]=n.split(",").map(Number),s=e.cellToWorld(r,o);x.position.set(s.x,.35,s.z),x.rotation.set(0,0,0),x.updateMatrix(),u.setMatrixAt(a,x.matrix),x.position.set(s.x,.95,s.z),x.rotation.set(0,0,0),x.updateMatrix(),i.setMatrixAt(a,x.matrix)}),u.count=l.length,i.count=l.length,u.instanceMatrix.needsUpdate=!0,i.instanceMatrix.needsUpdate=!0)},[e,l]),t.jsxs(t.Fragment,{children:[t.jsxs("instancedMesh",{ref:m,args:[null,null,e.gridSize*e.gridSize],castShadow:!0,receiveShadow:!0,frustumCulled:!1,children:[t.jsx("boxGeometry",{args:[e.cellSize*.72,.7,e.cellSize*.72]}),t.jsx("meshStandardMaterial",{color:"#1f2937",roughness:.78,emissive:"#0f172a",emissiveIntensity:.2})]}),t.jsxs("instancedMesh",{ref:p,args:[null,null,e.gridSize*e.gridSize],castShadow:!0,receiveShadow:!0,frustumCulled:!1,children:[t.jsx("coneGeometry",{args:[.45,.8,4]}),t.jsx("meshStandardMaterial",{color:"#a78bfa",roughness:.35,metalness:.2,emissive:"#7c3aed",emissiveIntensity:.55})]})]})}function Y({engine:e,structureVersion:v}){const m=c.useRef(),p=c.useRef(new Float32Array(e.gridSize*e.gridSize)),l=c.useRef(new Float32Array(e.gridSize*e.gridSize)),u=c.useMemo(()=>{const n=new Uint8Array(e.gridSize*e.gridSize*4);n.fill(0);const a=new L(n,e.gridSize,e.gridSize,U);return a.magFilter=M,a.minFilter=M,a.wrapS=b,a.wrapT=b,a.needsUpdate=!0,a},[e.gridSize]);c.useEffect(()=>{const n=l.current;n.fill(0);const a=(r,o,s,h)=>{for(let d=-s;d<=s;d+=1)for(let f=-s;f<=s;f+=1){const g=r+f,z=o+d;if(!e.inBounds(g,z))continue;const y=Math.sqrt(f*f+d*d);if(y>s)continue;const R=1-y/(s+.001),j=z*e.gridSize+g;n[j]=Math.max(n[j],h*R)}};a(0,0,6,1.25),e.walls.forEach(r=>{const[o,s]=r.split(",").map(Number);a(o,s,3,.75)}),e.turrets.forEach(r=>{const[o,s]=r.split(",").map(Number);a(o,s,4,1.1)})},[e,v]),A((n,a)=>{if(!m.current)return;const r=Math.min(a*3.5,1),o=u.image.data,s=p.current,h=l.current;for(let d=0;d<s.length;d+=1){s[d]+=(h[d]-s[d])*r;const f=d*4;o[f]=Math.round(255*F.clamp(s[d],0,1)),o[f+1]=o[f],o[f+2]=o[f],o[f+3]=255}u.needsUpdate=!0,m.current.uniforms.uTime.value=n.clock.elapsedTime});const i=c.useMemo(()=>({uTime:{value:0},uLightMap:{value:u},uGridSize:{value:e.gridSize},uWorldSize:{value:e.gridSize*e.cellSize}}),[e.cellSize,e.gridSize,u]);return t.jsxs("mesh",{rotation:[-Math.PI/2,0,0],receiveShadow:!0,children:[t.jsx("planeGeometry",{args:[e.gridSize*e.cellSize,e.gridSize*e.cellSize,1,1]}),t.jsx("shaderMaterial",{ref:m,uniforms:i,vertexShader:`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPosition.xyz;
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `,fragmentShader:`
          varying vec2 vUv;
          varying vec3 vWorldPos;
          uniform float uTime;
          uniform sampler2D uLightMap;
          uniform float uGridSize;
          uniform float uWorldSize;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }

          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
          }

          float fbm(vec2 p) {
            float value = 0.0;
            float amp = 0.5;
            for (int i = 0; i < 4; i++) {
              value += amp * noise(p);
              p *= 2.05;
              amp *= 0.5;
            }
            return value;
          }

          void main() {
            vec2 worldUv = ((vWorldPos.xz / uWorldSize) + 0.5);
            float revealRaw = texture2D(uLightMap, worldUv).r;
            float reveal = pow(clamp(revealRaw, 0.0, 1.0), 0.65);

            float dirt = fbm(vWorldPos.xz * 0.18 + vec2(0.0, uTime * 0.02));
            float stones = fbm(vWorldPos.xz * 0.55);
            float cracks = smoothstep(0.58, 0.82, fbm(vWorldPos.xz * 0.42 + 8.0));

            vec3 darkBase = vec3(0.02, 0.026, 0.035);
            vec3 litBase = vec3(0.48, 0.44, 0.36);
            vec3 color = mix(darkBase, litBase, reveal);
            color += vec3(dirt * 0.06 + stones * 0.03);
            color -= vec3(cracks * 0.08 * (1.0 - reveal * 0.6));
            color += vec3(0.18, 0.14, 0.1) * reveal * 0.65;

            float edgeFade = smoothstep(0.0, 0.08, worldUv.x) * smoothstep(0.0, 0.08, worldUv.y)
              * smoothstep(0.0, 0.08, 1.0 - worldUv.x) * smoothstep(0.0, 0.08, 1.0 - worldUv.y);
            color *= edgeFade;

            gl_FragColor = vec4(color, 1.0);
          }
        `})]})}function H({engine:e,structureVersion:v,controllerRef:m}){const p=c.useMemo(()=>{const i=["0,0"];return e.turrets.forEach(n=>i.push(n)),e.walls.forEach(n=>i.push(n)),i},[e,v]),l=m.current?.group?.translation?.()??w,u=c.useMemo(()=>{const i=l.x,n=l.z;return p.map(a=>{const[r,o]=a.split(",").map(Number),s=e.cellToWorld(r,o),h=(s.x-i)**2+(s.z-n)**2;return{key:a,world:s,distSq:h,isBase:a==="0,0"}}).sort((a,r)=>a.isBase?-1:r.isBase?1:a.distSq-r.distSq).slice(0,12)},[p,e,l.x,l.z]);return t.jsxs(t.Fragment,{children:[t.jsx("ambientLight",{intensity:.2,color:"#0f172a"}),t.jsx("hemisphereLight",{intensity:.16,color:"#1e293b",groundColor:"#020617"}),t.jsx("directionalLight",{castShadow:!0,position:[16,28,12],intensity:.55,color:"#64748b","shadow-mapSize":[2048,2048]}),u.map(i=>t.jsx("pointLight",{position:[i.world.x,1.25,i.world.z],intensity:i.isBase?2.6:1.65,distance:i.isBase?22:14,decay:2,color:i.isBase?"#fef3c7":"#c4b5fd",castShadow:i.isBase},i.key))]})}function oe(){const e=c.useMemo(()=>new O({gridSize:25,cellSize:2,maxEnemies:40,waveSize:20}),[]),v=S(r=>r.setSnapshot),m=S(r=>r.reset),p=S(r=>r.buildSelection),[l,u]=c.useState(0),i=c.useRef(),{gl:n}=P();c.useEffect(()=>(n.setClearColor("#000000",1),()=>{n.setClearColor("#000000",1)}),[n]),c.useEffect(()=>{if(typeof window>"u")return;const r=window.localStorage.getItem(E),o=window.localStorage.getItem(T);try{const s=r?JSON.parse(r):[],h=o?JSON.parse(o):[];Array.isArray(s)&&e.setWalls(s,!1),Array.isArray(h)&&e.setTurrets(h,!1),e.rebuildFlowField(),u(d=>d+1)}catch{}},[e]),c.useEffect(()=>{typeof window>"u"||(window.localStorage.setItem(E,JSON.stringify(Array.from(e.walls))),window.localStorage.setItem(T,JSON.stringify(Array.from(e.turrets))))},[e,l]),c.useEffect(()=>{const r=()=>e.forceNextWave(performance.now()/1e3),o=()=>e.forceAddAmplifier();return window.addEventListener("td:force-wave",r),window.addEventListener("td:add-amplifier",o),()=>{window.removeEventListener("td:force-wave",r),window.removeEventListener("td:add-amplifier",o),m()}},[e,m]),A((r,o)=>{e.update(Math.min(o,1/24),r.clock.getElapsedTime());const s=i.current?.group;s&&s.translation().y<-10&&(s.setTranslation(w,!0),s.setLinvel({x:0,y:0,z:0},!0));const h=e.enemies.reduce((d,f)=>d+Number(f.active),0);v({waveNumber:e.waveNumber,activeEnemies:h,maxEnemies:e.maxEnemies,pendingSpawns:e.pendingSpawns.length,wallCount:e.walls.size,turretCount:e.turrets.size,biomass:e.biomass,energy:e.energy,carbon:e.carbon,uranium:e.uranium,crystal:e.crystal,amplifierCount:e.activeAmplifierIds.length,activeAmplifiers:e.activeAmplifiers,enemyTypes:e.enemyTypes})});const a=e.gridSize*e.cellSize;return t.jsxs(t.Fragment,{children:[t.jsx("color",{attach:"background",args:["#000000"]}),t.jsx("fog",{attach:"fog",args:["#050510",15,80]}),t.jsx(_,{radius:100,depth:50,count:2e3,factor:4,fade:!0,speed:.5}),t.jsx(H,{engine:e,structureVersion:l,controllerRef:i}),t.jsxs(B,{timeStep:"vary",children:[t.jsx(G,{map:C,children:t.jsx(q,{controllerRef:i})}),t.jsx(N,{type:"fixed",colliders:!1,children:t.jsx(D,{args:[a/2,.1,a/2],position:[0,-.1,0]})}),t.jsxs("group",{onPointerDown:r=>{if(r.button!==2)return;r.stopPropagation();const o=e.worldToCell(r.point.x,r.point.z);p==="turret"?e.toggleTurret(o.x,o.z):e.toggleWall(o.x,o.z),u(s=>s+1)},onContextMenu:r=>{r.preventDefault()},children:[t.jsx(Y,{engine:e,structureVersion:l}),t.jsx("gridHelper",{args:[a,e.gridSize,"#111827","#1f2937"],position:[0,.02,0]})]}),t.jsxs("mesh",{position:[0,.35,0],castShadow:!0,receiveShadow:!0,children:[t.jsx("cylinderGeometry",{args:[1,1.3,.7,24]}),t.jsx("meshStandardMaterial",{color:"#f59e0b",roughness:.35,emissive:"#f97316",emissiveIntensity:1.1})]}),t.jsx(J,{engine:e,structureVersion:l}),t.jsx(V,{engine:e,structureVersion:l}),t.jsx(k,{engine:e})]})]})}export{oe as default};
