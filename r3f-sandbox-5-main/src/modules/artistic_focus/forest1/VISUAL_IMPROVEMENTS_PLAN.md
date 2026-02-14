# Forest1 Visual Improvements Plan

## Current State
- Basic box tiles with toon materials
- Simple color variations based on noise values
- Flat terrain

## Proposed Improvements

### Phase 1: Enhanced Tile Visuals
1. **Height Variation**
   - Make tiles have actual height differences based on noise value
   - Create hills and valleys
   - Smooth transitions between heights

2. **Better Tile Geometry**
   - Replace flat boxes with more interesting shapes
   - Add subtle variations (slight rotations, scales)
   - Maybe add some edge details

3. **Improved Materials**
   - Better color gradients
   - Add texture variations
   - Consider adding normal maps or roughness variations

### Phase 2: 3D Object Placement
1. **Tree Placement System**
   - Place trees on grass tiles based on noise value
   - Vary tree types and sizes
   - Add clustering logic (trees like to be near other trees)

2. **Rock/Boulder Placement**
   - Place rocks on rock tiles
   - Vary sizes and rotations
   - Add to sand/grass areas for variety

3. **Vegetation Details**
   - Small bushes/grass tufts
   - Flowers or decorative elements
   - Ground clutter

### Phase 3: Atmosphere & Effects
1. **Fog/Atmosphere**
   - Distance fog for depth
   - Color tinting based on time of day

2. **Particle Effects**
   - Falling leaves
   - Dust particles
   - Ambient movement

3. **Better Lighting**
   - Time-of-day system
   - Color temperature variations
   - Dynamic shadows

### Phase 4: Advanced Features
1. **Water Features**
   - Rivers/streams on low-lying tiles
   - Water shader effects

2. **Path System**
   - Procedural paths connecting areas
   - Road-like tiles

3. **Structures**
   - Small buildings or ruins
   - Decorative structures

## Implementation Priority
1. ✅ Height variation (quick win, big impact)
2. ✅ Tree placement system (uses existing tree1.glb)
3. ✅ Better tile materials and colors
4. Rock/boulder placement
5. Fog/atmosphere
6. Additional vegetation details

