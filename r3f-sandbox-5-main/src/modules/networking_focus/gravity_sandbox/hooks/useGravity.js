// hooks/useGravity.js
import { useRef, useMemo } from "react";
import { loadLevel } from "../../../procedural_ground/utils/loadLevel";
import * as THREE from "three";

const GRAVITY = -20; // Gravity acceleration
const GROUND_Y = 0.01; // Top of tiles (tile at y=-0.24, height 0.5, so top is at -0.24 + 0.25 = 0.01)
const TILE_SIZE = 1;
const TILE_HALF_SIZE = 0.49; // Tiles are 0.98 wide, so half is 0.49

/**
 * Hook to get ground collision info and check if position is on ground
 */
export function useGravity() {
  // Load tile data once
  const tiles = useMemo(() => loadLevel(), []);
  const tileMap = useMemo(() => {
    // Create a map for quick lookup: key = "x,y" -> tile exists
    // Note: tile.y in JSON becomes z in 3D space, but we use the original JSON coordinates for the key
    const map = new Map();
    tiles.forEach((tile) => {
      const key = `${tile.x},${tile.y}`; // tile.y is the z coordinate in 3D
      map.set(key, tile);
    });
    return map;
  }, [tiles]);

  /**
   * Check if a position (x, z) is on a tile
   * Returns the tile's top Y position if on tile, null otherwise
   */
  const getGroundHeight = (x, z) => {
    // Convert world position to tile coordinates
    const tileX = Math.round(x / TILE_SIZE);
    const tileZ = Math.round(z / TILE_SIZE);
    
    // Check if tile exists at this position
    // Note: tile.y in JSON is the z coordinate in 3D
    const key = `${tileX},${tileZ}`;
    if (tileMap.has(key)) {
      return GROUND_Y;
    }
    
    return null; // No tile at this position
  };

  /**
   * Check if position is on ground (within tile bounds)
   */
  const isOnGround = (x, z) => {
    const tileX = Math.round(x / TILE_SIZE);
    const tileZ = Math.round(z / TILE_SIZE);
    // Note: tile.y in JSON is the z coordinate in 3D
    const key = `${tileX},${tileZ}`;
    
    if (!tileMap.has(key)) return false;
    
    // Check if within tile bounds (tiles are 0.98 wide, so check within 0.49 of center)
    const localX = x - (tileX * TILE_SIZE);
    const localZ = z - (tileZ * TILE_SIZE);
    
    return Math.abs(localX) <= TILE_HALF_SIZE && Math.abs(localZ) <= TILE_HALF_SIZE;
  };

  return { getGroundHeight, isOnGround, GRAVITY, GROUND_Y };
}

