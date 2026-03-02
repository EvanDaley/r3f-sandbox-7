# Tower Defense Sandbox 1 Setup (LLM-Friendly)

This document gives a concise map of the tower defense sandbox implementation.

## Primary files

- Scene entry: `src/modules/tower_defense_sandbox_1/TowerDefenseSandbox1.jsx`
- Simulation engine: `src/modules/tower_defense_sandbox_1/core/TowerDefenseEngine.js`
- Pathfinding strategy: `src/modules/tower_defense_sandbox_1/core/strategies/FlowFieldPathfindingStrategy.js`
- Steering strategy: `src/modules/tower_defense_sandbox_1/core/strategies/FlockingSteeringStrategy.js`
- HUD: `src/modules/tower_defense_sandbox_1/components/TowerDefenseHud.jsx`
- UI state store: `src/modules/tower_defense_sandbox_1/stores/useTowerDefenseUiStore.js`

## Runtime model

- `TowerDefenseSandbox1.jsx` owns rendering, player controls, pointer build interactions, and syncing HUD state.
- `TowerDefenseEngine.js` owns all game-state simulation: waves, enemy spawning, movement, walls, turrets, and projectiles.
- The scene ticks engine state with `engine.update(delta, elapsed)` from `useFrame`.

## Build system behavior

- Build mode is selected from the in-scene **Build Menu** (`wall` or `turret`).
- Right-clicking the terrain toggles the selected structure at that grid cell.
- Walls are persisted in browser storage under key `tower-defense-sandbox-1:walls`.
- Turrets are persisted in browser storage under key `tower-defense-sandbox-1:turrets`.
- On scene init, both walls and turrets are restored from localStorage and pathfinding is rebuilt.

## Turret behavior (current baseline)

- Turrets are stored as grid keys (`"x,z"`) in `engine.turrets` and block AI pathing the same way walls do.
- Turrets fire periodically when enemies are within range.
- A projectile tracks position/velocity/ttl/damage and is removed on hit or timeout.
- Enemy damage is applied in engine update; enemies deactivate when health <= 0.

## Rendering notes

- Walls and turrets are rendered with `instancedMesh` for scale.
- Turret visuals are intentionally simple primitives:
  - Base: box
  - Top: 4-sided cone (pyramid-like)
- Projectiles are rendered as small emissive spheres.

## Extension points

- Add economy: place cost checks in pointer handler and/or engine toggles.
- Add upgrades: include per-turret metadata rather than plain Set keys.
- Add targeting modes: closest, strongest, first, last.
- Add persisted turrets: mirror wall persistence with another storage key.
