# Blender Scene Setup Guide

This guide explains how to set up your Blender scene to work with the `third_person_blender_integrated` module.

## Scene Export

1. Create your scene in Blender with all static geometry and lighting
2. Position and scale everything exactly as you want it in the final scene
3. Export as GLB format
4. Save the file to: `public/models/third_person_blender_integrated/scene.glb`

## Important Notes

- The entire scene will be rendered with physics colliders automatically
- All objects in the scene will have trimesh colliders for physics
- Position and scale in Blender are preserved in the game
- The scene is loaded and rendered as-is from the GLB file
