# Character Animation System Documentation

This document explains how the character animation system works in this React Three Fiber project, including input handling, code structure, and how animations are referenced and played.

## Table of Contents

- [Overview](#overview)
- [Input Mapping](#input-mapping)
- [Animation Flow](#animation-flow)
- [Code Structure](#code-structure)
- [Animation Set Configuration](#animation-set-configuration)
- [Model Animation Names](#model-animation-names)
- [Animation Types](#animation-types)
- [Special Features](#special-features)

## Overview

The animation system uses a state-based approach where:
1. **User inputs** trigger animation state changes
2. **Character controller** (`Ecctrl`) detects movement/physics states and calls animation functions
3. **Zustand store** (`useGame`) manages the current animation state
4. **Character model** (`CharacterModel`) plays the appropriate animation from the GLB file

## Input Mapping

Keyboard inputs are configured in `ThirdPersonBlenderIntegrated.jsx`:

```javascript
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "run", keys: ["Shift"] },
  { name: "action1", keys: ["1"] },
  { name: "action2", keys: ["2"] },
  { name: "action3", keys: ["3"] },
  { name: "action4", keys: ["KeyF"] },
];
```

### Input to Animation Mapping

| Input | Animation Triggered | Notes |
|-------|-------------------|-------|
| No movement keys + On ground | `idle()` | Standing still |
| Movement keys (WASD/Arrows) | `walk()` or `run()` | Depends on Shift key |
| Shift + Movement keys | `run()` | Sprinting |
| Space (while on ground) | `jump()` | Jump start |
| In air (after jump) | `jumpIdle()` | Automatic transition |
| Landing | `jumpLand()` | Automatic transition |
| Falling (no ground detected) | `fall()` | High fall detection |
| Key "1" | `action1()` | Only from idle |
| Key "2" | `action2()` | Only from idle |
| Key "3" | `action3()` | Only from idle |
| Key "F" | `action4()` | From idle, walk, or run |

## Animation Flow

The animation system follows this flow:

```
User Input
    ↓
KeyboardControls (detects key press)
    ↓
Ecctrl Controller (detects movement/physics state)
    ↓
useGame Store (calls animation function: idle(), walk(), run(), etc.)
    ↓
State Update (curAnimation changes)
    ↓
CharacterModel useEffect (watches curAnimation)
    ↓
Three.js AnimationAction (plays animation from GLB)
```

### Detailed Flow Example: Walking

1. User presses `W` or `ArrowUp`
2. `KeyboardControls` detects "forward" key
3. `Ecctrl` controller detects movement input
4. `Ecctrl` checks if Shift is held:
   - If Shift held → calls `runAnimation()` from `useGame`
   - If Shift not held → calls `walkAnimation()` from `useGame`
5. `useGame.walk()` updates `curAnimation` state to `animationSet.walk`
6. `CharacterModel`'s `useEffect` detects `curAnimation` change
7. `useEffect` finds the animation action: `actions["Walk"]`
8. Animation plays with fade-in transition

## Code Structure

### 1. Zustand Store (`useGame.ts`)

The `useGame` store manages animation state using Zustand:

**Location:** `src/modules/third_person_controller/stores/useGame.ts`

**Key Functions:**
- `initializeAnimationSet(animationSet)` - Registers animation name mappings
- `idle()`, `walk()`, `run()`, `jump()`, etc. - Update `curAnimation` state
- `reset()` - Returns to idle animation

**State:**
- `curAnimation: string | null` - Current animation name (from animationSet)
- `animationSet: AnimationSet` - Maps logical names to model animation names

### 2. Character Controller (`Ecctrl.tsx`)

The character controller detects movement and physics states, then triggers animations:

**Location:** `src/modules/third_person_controller/Ecctrl.tsx`

**Key Animation Triggers:**
```typescript
// In useFrame hook (runs every frame):
if (animated) {
  // Idle: no movement, on ground
  if (!forward && !backward && !leftward && !rightward && canJump) {
    idleAnimation && idleAnimation();
  }
  // Jump: space pressed, on ground
  else if ((jump || button1Pressed) && canJump) {
    jumpAnimation && jumpAnimation();
  }
  // Walk/Run: moving, on ground
  else if (canJump && (forward || backward || leftward || rightward)) {
    (run || runState) 
      ? runAnimation && runAnimation() 
      : walkAnimation && walkAnimation();
  }
  // Jump idle: in air
  else if (!canJump) {
    jumpIdleAnimation && jumpIdleAnimation();
  }
  // Fall: no ground detected, falling
  if (rayHit == null && isFalling) {
    fallAnimation && fallAnimation();
  }
}
```

**Animation Functions:**
These are imported from `useGame` store:
- `idleAnimation = useGame((state) => state.idle)`
- `walkAnimation = useGame((state) => state.walk)`
- `runAnimation = useGame((state) => state.run)`
- etc.

### 3. Character Model (`CharacterModel.jsx`)

The character model component loads the GLB file and plays animations:

**Location:** `src/modules/third_person_blender_integrated/CharacterModel.jsx`

**Key Parts:**

1. **Load GLB and Extract Animations:**
```javascript
const { nodes, animations } = useGLTF("./models/third_person_controller/Floating Character.glb")
const { actions } = useAnimations(animations, group);
```

2. **Define Animation Set Mapping:**
```javascript
const animationSet = {
  idle: "Idle",           // Maps to "Idle" animation in GLB
  walk: "Walk",           // Maps to "Walk" animation in GLB
  run: "Run",             // Maps to "Run" animation in GLB
  jump: "Jump_Start",     // Maps to "Jump_Start" animation in GLB
  jumpIdle: "Jump_Idle", // Maps to "Jump_Idle" animation in GLB
  jumpLand: "Jump_Land", // Maps to "Jump_Land" animation in GLB
  fall: "Climbing",      // Maps to "Climbing" animation in GLB
  action1: "Wave",        // Maps to "Wave" animation in GLB
  action2: "Dance",       // Maps to "Dance" animation in GLB
  action3: "Cheer",       // Maps to "Cheer" animation in GLB
  action4: "Attack(1h)",  // Maps to "Attack(1h)" animation in GLB
};
```

3. **Initialize Animation Set:**
```javascript
useEffect(() => {
  initializeAnimationSet(animationSet);
}, []);
```

4. **Watch for Animation Changes and Play:**
```javascript
useEffect(() => {
  const action = actions[curAnimation ? curAnimation : animationSet.jumpIdle];
  
  // One-shot animations (jump, actions)
  if (curAnimation === animationSet.jump || 
      curAnimation === animationSet.jumpLand ||
      curAnimation === animationSet.action1 ||
      // ... etc
     ) {
    action
      .reset()
      .fadeIn(0.2)
      .setLoop(THREE.LoopOnce, undefined)
      .play();
    action.clampWhenFinished = true;
  } 
  // Looping animations (idle, walk, run)
  else {
    action.reset().fadeIn(0.2).play();
  }
  
  // Reset to idle when animation finishes
  action._mixer.addEventListener("finished", () => resetAnimation());
}, [curAnimation]);
```

## Animation Set Configuration

The `animationSet` object in `CharacterModel.jsx` maps logical animation names to the actual animation names in your GLB file.

**Current Configuration:**
```javascript
const animationSet = {
  idle: "Idle",
  walk: "Walk",
  run: "Run",
  jump: "Jump_Start",
  jumpIdle: "Jump_Idle",
  jumpLand: "Jump_Land",
  fall: "Climbing",
  action1: "Wave",
  action2: "Dance",
  action3: "Cheer",
  action4: "Attack(1h)",
};
```

**To Use Your Own Character:**
1. Export your character GLB with animations
2. Update the `animationSet` object to match your animation names:
```javascript
const animationSet = {
  idle: "YourIdleAnimationName",
  walk: "YourWalkAnimationName",
  // ... etc
};
```

## Model Animation Names

Animations are referenced by their **exact names** as they appear in the GLB file. These names are set when you export from Blender (or your 3D software).

### How to Check Animation Names

1. Load your GLB in Blender
2. Go to the Animation workspace
3. Check the Action Editor - animation names are listed there
4. Or use a GLB viewer online to inspect animation names

### Required Animation Names

Your GLB file must contain animations with these names (or you must map them in `animationSet`):

- `Idle` (or mapped name)
- `Walk` (or mapped name)
- `Run` (or mapped name)
- `Jump_Start` (or mapped name)
- `Jump_Idle` (or mapped name)
- `Jump_Land` (or mapped name)
- `Climbing` (or mapped name) - used for falling
- `Wave` (or mapped name) - optional action1
- `Dance` (or mapped name) - optional action2
- `Cheer` (or mapped name) - optional action3
- `Attack(1h)` (or mapped name) - optional action4

## Animation Types

### Looping Animations

These animations play continuously:

- **idle** - Standing still
- **walk** - Walking movement
- **run** - Running/sprinting
- **jumpIdle** - In-air animation
- **fall** - Falling animation

**Code:**
```javascript
action.reset().fadeIn(0.2).play(); // Default loop behavior
```

### One-Shot Animations

These animations play once and then clamp (hold last frame):

- **jump** - Jump start
- **jumpLand** - Landing
- **action1, action2, action3, action4** - Custom actions

**Code:**
```javascript
action
  .reset()
  .fadeIn(0.2)
  .setLoop(THREE.LoopOnce, undefined)
  .play();
action.clampWhenFinished = true;
```

When a one-shot animation finishes, it automatically triggers `resetAnimation()`, which returns to the idle animation.

## Special Features

### Hand Tracking (Action4/Attack)

The attack animation (`action4`) includes hand tracking for collision detection:

**Bone Names Required:**
- `handSlotRight` - Right hand bone
- `handSlotLeft` - Left hand bone

**How It Works:**
1. `useFrame` hook tracks hand bone positions during attack
2. Hand colliders are positioned to match hand bones
3. Collision detection triggers punch effects

**Code Location:** `CharacterModel.jsx` lines 131-152

### Action-Specific Features

**Action3 (Cheer):**
- Shows/hides a "mug" model object
- Requires a bone/object named `mug` in the model

**Action4 (Attack):**
- Tracks hand positions for collision
- Triggers punch effect sprite on collision
- Can interrupt walk/run animations

### Animation Transitions

All animations use **fade transitions** (0.2 seconds) for smooth blending:
- `fadeIn(0.2)` - When starting
- `fadeOut(0.2)` - When stopping

### Animation State Management

The system prevents certain animations from interrupting others:

- **Actions 1-3** can only trigger from `idle`
- **Action4** can trigger from `idle`, `walk`, or `run`
- **Action4** cannot be interrupted by walk/run
- **Jump sequence** follows: `jump` → `jumpIdle` → `jumpLand` → `idle`

## Troubleshooting

### Animation Not Playing

1. **Check animation name:** Ensure the name in `animationSet` matches the GLB animation name exactly (case-sensitive)
2. **Check GLB export:** Verify animations are included in the GLB export
3. **Check console:** Look for errors about missing animations

### Animation Plays But Looks Wrong

1. **Check loop settings:** Ensure looping animations are set to loop in Blender
2. **Check animation length:** Very short animations may not be visible
3. **Check fade timing:** Adjust `fadeIn(0.2)` value if transitions are too fast/slow

### Action Animations Not Triggering

1. **Check keyboard mapping:** Verify keys are mapped in `keyboardMap`
2. **Check state requirements:** Some actions only work from specific states (e.g., action1-3 only from idle)
3. **Check animation name:** Ensure the action animation exists in the GLB

## Summary

The animation system works by:
1. Mapping keyboard inputs to movement states
2. Using the character controller to detect these states
3. Updating animation state in the Zustand store
4. Playing the corresponding animation from the GLB file
5. Handling transitions and one-shot animations automatically

To customize for your character, simply update the `animationSet` mapping in `CharacterModel.jsx` to match your GLB animation names.

