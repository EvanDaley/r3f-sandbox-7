# Comparison: ragdoll-physics-forked vs main app (objects_1)

## Current status: what’s matched

- **Drag.js** – Same as forked (useEffect disable, viewport Cursor formula, no activeDragApiRef).
- **Guy.jsx** – Same structure and joint access (`joints['neckJoint']` etc.).
- **Block** – Same (RoundedBox, props).
- **createRagdoll** – Same shapes/joints.
- **Objects1Scene** – Same Physics children and positions: Cursor, Guy, Floor, Chair, Table, Mug, Lamp.
- **Camera / dpr** – When `currentSceneId === "1_objects"`, ThreeCanvas passes forked camera and `dpr={[1, 2]}`.

---

## Remaining differences

### 1. Canvas wrapper (ThreeCanvas vs forked App)

| Aspect | Forked | Main app |
|--------|--------|----------|
| **Canvas mount** | Always mounted (no scene switcher). | Only when `SceneComponent` exists (scene selector). |
| **Suspense** | None. | `<Suspense fallback={null}>` wraps scene. |
| **Bvh** | None. | `<Bvh firstHitOnly>` wraps scene. |
| **Canvas pointer** | None. | `onPointerDown` / `onPointerUp` for middle-click pointer lock. |
| **camera / dpr** | Always set on Canvas. | Set only when `currentSceneId === "1_objects"`; other scenes get defaults. |

### 2. Mug visual

| | Forked | Main app |
|---|--------|----------|
| **Mug** | `useGLTF('/cup.glb')` – cup + liquid meshes. | Plain cylinder (`cylinderGeometry` + `meshStandardMaterial`), no GLTF (no `cup.glb` in project). |

Physics and drag are the same; only the mesh differs.

### 3. Lazy loading

- **Forked:** App is the root; scene content is not code-split.
- **Main:** Objects1Scene is loaded with `lazy(() => import("../modules/objects_1"))`, so it mounts inside React’s Suspense for the lazy chunk.

### 4. Dependency versions

| | Forked | Main app |
|---|--------|----------|
| **@react-three/fiber** | 8.0.27 | ^9.1.2 |
| **@react-three/cannon** | 6.3.0 | ^6.6.0 |
| **React** | 18.2.0 | 19.x |
| **@react-three/drei** | 9.16.0 | ^10.3.0 |

### 5. Cosmetic

- Forked uses `.js` and single quotes; main uses `.jsx` and double quotes where we added/modified files.
- Floor position: forked `[0, -5, 0]`, main `[0, FLOOR_Y, 0]` with `FLOOR_Y = -5` (same value).
