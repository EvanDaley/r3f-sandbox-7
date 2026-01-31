# Blender Scene Setup Guide

This guide explains how to set up your Blender scene to work with the `third_person_blender_integrated` module.

## Philosophy

**Blender controls**: Position, scale, and how many objects exist  
**Code controls**: Behavior and functionality (physics, animation)

This means you can design your entire scene in Blender, position everything exactly where you want it, and the code will automatically attach the appropriate behavior to objects based on their names.

## Scene Export

1. Create your scene in Blender with all static geometry, lighting, and moving platforms
2. Position and scale everything exactly as you want it in the final scene
3. Export as GLB format
4. Save the file to: `public/models/third_person_blender_integrated/scene.glb`

## Naming Conventions for Moving Platforms

Objects in Blender should be named with specific patterns to enable automatic animation:

### Basic Patterns

#### 1. Moving Platform (Horizontal Movement)
- **Pattern**: `platform_move_<id>`
- **Example**: `platform_move_1`, `platform_move_2`
- **Behavior**: Moves horizontally in a sinusoidal pattern

#### 2. Rotating Platform
- **Pattern**: `platform_rotate_<id>`
- **Example**: `platform_rotate_1`
- **Behavior**: Rotates continuously around an axis

#### 3. Elevating Platform (Vertical Movement)
- **Pattern**: `platform_elevate_<id>`
- **Example**: `platform_elevate_1`
- **Behavior**: Moves vertically in a sinusoidal pattern

#### 4. Circular Platform
- **Pattern**: `platform_circular_<id>`
- **Example**: `platform_circular_1`
- **Behavior**: Moves in a circular path

### Advanced Options

You can add optional suffixes to customize behavior:

#### For Moving Platforms (`platform_move_*`)

- **Axis**: `_x`, `_y`, or `_z` (default: `x`)
  - Example: `platform_move_1_x` (moves along X axis)
  - Example: `platform_move_1_z` (moves along Z axis)

- **Speed**: `_speed_<number>` (default: `2`)
  - Lower = slower movement
  - Example: `platform_move_1_speed_1` (slower)
  - Example: `platform_move_1_speed_4` (faster)

- **Amplitude**: `_amplitude_<number>` (default: `5`)
  - Distance the platform travels
  - Example: `platform_move_1_amplitude_10` (travels 10 units)

- **Combined Example**: `platform_move_1_x_speed_2_amplitude_5`
  - Moves along X axis, speed of 2, amplitude of 5

#### For Rotating Platforms (`platform_rotate_*`)

- **Axis**: `_x`, `_y`, or `_z` (default: `y`)
  - Example: `platform_rotate_1_y` (rotates around Y axis)
  - Example: `platform_rotate_1_x` (rotates around X axis)

- **Speed**: `_speed_<number>` (default: `0.5`)
  - Rotation speed in radians per second
  - Example: `platform_rotate_1_speed_1` (faster rotation)
  - Example: `platform_rotate_1_speed_0.25` (slower rotation)

- **Combined Example**: `platform_rotate_1_y_speed_0.5`
  - Rotates around Y axis at speed 0.5

#### For Elevating Platforms (`platform_elevate_*`)

- **Speed**: `_speed_<number>` (default: `2`)
  - Example: `platform_elevate_1_speed_1` (slower)

- **Amplitude**: `_amplitude_<number>` (default: `2`)
  - Vertical travel distance
  - Example: `platform_elevate_1_amplitude_5` (travels 5 units up/down)

- **Offset**: `_offset_<number>` (default: `0`)
  - Base height offset
  - Example: `platform_elevate_1_offset_3` (starts 3 units higher)

- **Combined Example**: `platform_elevate_1_speed_2_amplitude_3_offset_1`
  - Elevates with speed 2, amplitude 3, starting 1 unit higher

#### For Circular Platforms (`platform_circular_*`)

- **Radius**: `_radius_<number>` (default: `5`)
  - Circle radius
  - Example: `platform_circular_1_radius_10` (larger circle)

- **Speed**: `_speed_<number>` (default: `1`)
  - Rotation speed
  - Example: `platform_circular_1_speed_2` (faster)

- **Axis**: `_axis_<x|y|z>` (default: `y`)
  - Plane of rotation
  - `y` = circular motion in XZ plane (horizontal circle)
  - `x` = circular motion in YZ plane (vertical circle)
  - `z` = circular motion in XY plane (vertical circle)

- **Combined Example**: `platform_circular_1_radius_5_speed_1_axis_y`
  - Circular motion in XZ plane, radius 5, speed 1

## Complete Naming Examples

```
platform_move_1                    # Simple horizontal movement (X axis, default settings)
platform_move_2_z_speed_3          # Moves along Z axis, faster speed
platform_rotate_1                  # Simple rotation (Y axis, default settings)
platform_rotate_2_x_speed_1        # Rotates around X axis, faster
platform_elevate_1                 # Simple vertical movement (default settings)
platform_elevate_2_amplitude_5     # Larger vertical travel distance
platform_circular_1                # Simple circular motion (default settings)
platform_circular_2_radius_10_axis_y  # Larger circle in horizontal plane
```

## Important Notes

1. **Object Names**: The naming pattern must start with `platform_` followed by the type
2. **ID Required**: Each platform needs a unique ID (number or identifier)
3. **Position Matters**: The platform's initial position in Blender will be its starting point - the code respects this!
4. **Scale Matters**: The platform's scale in Blender is preserved - design it at the size you want
5. **Colliders**: Platforms automatically get hull colliders for physics based on their geometry
6. **Static Objects**: Objects without the `platform_` prefix will be rendered as static geometry exactly as positioned in Blender
7. **Visual Objects Stay in Scene**: Platform objects remain in the Blender scene for rendering, and the code attaches physics behavior to them

## Tips

- Test with simple names first (`platform_move_1`), then add parameters
- Use descriptive IDs to keep track of multiple platforms
- The platform's initial rotation in Blender is preserved for rotating platforms
- For complex movements, you can combine multiple platforms or create custom animation logic
