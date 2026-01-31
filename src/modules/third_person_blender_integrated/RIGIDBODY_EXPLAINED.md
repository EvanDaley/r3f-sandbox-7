# RigidBody Component Explained

## Overview

`RigidBody` is a React Three Fiber component from `@react-three/rapier` that wraps Three.js objects to give them physics properties. It connects your 3D objects to the Rapier physics engine.

## Basic Structure

```jsx
<RigidBody type="fixed" colliders="trimesh">
  <primitive object={scene} />
</RigidBody>
```

The `RigidBody` component:
1. **Wraps** your 3D objects (meshes, groups, scenes, etc.)
2. **Creates** a physics body in the Rapier physics world
3. **Generates** collision shapes (colliders) from the wrapped geometry
4. **Synchronizes** the visual position/rotation with the physics simulation

## Key Props

### `type` - Body Type

Controls how the physics body behaves:

- **`"fixed"`** (default) - Immovable, like walls or floors
  - Never moves, even when hit
  - Infinite mass
  - Used for static environment geometry
  - Example: Your BlenderScene uses this for the static scene

- **`"dynamic"`** - Fully simulated physics object
  - Responds to forces, gravity, collisions
  - Has mass and can move/rotate
  - Example: Boxes that fall, objects you can push

- **`"kinematicPosition"`** - Moves via code, but affects other objects
  - You control position/rotation programmatically
  - Can push dynamic objects
  - Used for moving platforms, elevators
  - Example: DynamicPlatforms uses this for moving platforms

- **`"kinematicVelocity"`** - Moves via velocity, affects other objects
  - You set velocity, physics handles movement
  - Can push dynamic objects

### `colliders` - Collision Shape Generation

How to create collision shapes from the geometry:

- **`"trimesh"`** - Exact triangle mesh collision
  - Matches the visual geometry exactly
  - More accurate but slower
  - Good for complex static geometry (like your Blender scene)
  - Example: `colliders="trimesh"` in BlenderScene

- **`"hull"`** - Convex hull around the geometry
  - Faster than trimesh
  - Only works for convex shapes
  - Good for simple objects

- **`"cuboid"`** - Fits a box around the geometry
  - Very fast
  - Only works for box-like shapes

- **`false`** - No automatic colliders
  - You manually add collider components as children
  - Example: `colliders={false}` with `<CuboidCollider />` inside

### Manual Colliders

When `colliders={false}`, you add collider components as children:

```jsx
<RigidBody colliders={false}>
  <CuboidCollider args={[width, height, depth]} />
  <BallCollider args={[radius]} />
  <CylinderCollider args={[radius, height]} />
  <CapsuleCollider args={[halfHeight, radius]} />
  <mesh>...</mesh>
</RigidBody>
```

## How It Works Internally

1. **Initialization**: When the component mounts, it:
   - Creates a Rapier rigid body handle
   - Generates colliders from geometry (if `colliders` is set)
   - Registers the body with the physics world

2. **Each Frame**: The physics engine:
   - Simulates physics (gravity, collisions, forces)
   - Updates the rigid body's position/rotation
   - RigidBody syncs the visual object's transform to match

3. **For Kinematic Bodies**: You control movement:
   ```jsx
   const ref = useRef();
   
   useFrame(() => {
     ref.current?.setNextKinematicTranslation({ x, y, z });
   });
   
   <RigidBody type="kinematicPosition" ref={ref}>
   ```

## Common Patterns

### Static Environment (Your Current Use)
```jsx
<RigidBody type="fixed" colliders="trimesh">
  <primitive object={scene} />
</RigidBody>
```
- Entire scene gets physics colliders
- Never moves
- Efficient for complex static geometry

### Dynamic Objects
```jsx
<RigidBody position={[0, 5, 0]} mass={1}>
  <mesh>
    <boxGeometry />
  </mesh>
</RigidBody>
```
- Falls with gravity
- Responds to collisions
- Can be pushed

### Moving Platforms
```jsx
<RigidBody 
  type="kinematicPosition" 
  colliders={false}
  ref={platformRef}
>
  <CuboidCollider args={[2.5, 0.1, 2.5]} />
  <mesh>...</mesh>
</RigidBody>

// In useFrame:
platformRef.current?.setNextKinematicTranslation({ x, y, z });
```
- You control movement
- Physics collider moves with it
- Can push dynamic objects

## Important Notes

1. **Children are relative**: Objects inside RigidBody are positioned relative to the RigidBody
2. **Position prop**: Sets the RigidBody's world position
3. **Ref gives access**: Use refs to access the RapierRigidBody API for advanced control
4. **One RigidBody per object**: Each physics body needs its own RigidBody wrapper
5. **Performance**: `trimesh` is slower but more accurate; use simpler colliders when possible

## Your Current Issue

In `BlenderScene.jsx`, you're using:
```jsx
<RigidBody type="fixed" colliders="trimesh">
  <primitive object={scene} />
</RigidBody>
```

This creates a **single fixed physics body** for the entire scene. When you move `platform_move_2` visually, the physics collider doesn't move because it's part of this static trimesh.

**Solution**: Extract `platform_move_2` and give it its own `kinematicPosition` RigidBody so the physics collider moves with it.
