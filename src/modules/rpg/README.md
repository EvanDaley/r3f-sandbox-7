# RPG Module

A modular progression framework for skill-based RPG mechanics inspired by RuneScape/Valheim-style loops.

## Goals

- **Reusable progression math** (shared XP curves, level caps, per-skill overrides).
- **Extensible input layer** (action-driven keyboard/mouse bindings to support remapping).
- **Clean state boundaries** (progression state isolated in its own store).
- **Composable scene pieces** (player, stations, HUD, config all split by concern).

## Folder structure

- `core/leveling.js`
  - Pure XP/level logic (curve normalization, XP thresholds, progress percentages).
- `core/input/`
  - Action-centric input contracts and a hook that tracks keyboard/mouse state.
  - Use this as the single place to add rebinding / gamepad support later.
- `stores/useRpgProgressionStore.js`
  - RPG progression store factory + demo store instance.
- `config/trainingStations.js`
  - Data-only station definitions.
- `components/`
  - `RpgPlayerCharacter.jsx`: animated player character wrapper.
  - `TrainingStation.jsx`: visual station building block.
  - `ProgressionHud.jsx`: fixed-screen progression UI.
- `RpgProgressionDemoScene.jsx`
  - Scene orchestration only (movement, interaction checks, camera settings).

## Input design

Input uses **actions**, not raw keys:

- `moveForward`, `moveBackward`, `moveLeft`, `moveRight`
- `interact`
- `resetProgression`
- `cameraRotate`

Add or override bindings by extending `DEFAULT_RPG_BINDINGS` in:

- `core/input/bindings.js`

This keeps gameplay logic independent from specific keys/buttons.

## Character animation integration

The demo character uses clips from `Floating Character.glb`.

Current mapping:

- Movement: `Run` / `Idle`
- Training interactions:
  - `woodcutting` -> `Attack(1h)`
  - `mining` -> `Attack(1h)`
  - `crafting` -> `Cheer`
  - `combat` -> `Attack(1h)`

Animation mapping is centralized in:

- `components/RpgPlayerCharacter.jsx` (`TASK_ANIMATION_BY_SKILL`)

## Extensibility notes

Recommended next increments:

1. Promote input state to a dedicated store for multiplayer/controller support.
2. Add station archetypes (resource node, crafting station, enemy target) as pluggable behaviors.
3. Move XP reward rules into data-driven progression config (per biome, tool tier, buffs).
4. Add save/load adapters so progression is persistence-agnostic.

## Demo controls

- `WASD` move
- `E` interact with nearby training station
- `R` reset progression
- `Middle mouse` rotate camera
- `Left mouse` camera movement disabled
