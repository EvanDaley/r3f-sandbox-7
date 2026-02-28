# UI Panel Architecture Proposal

## Goals

- Keep panel behavior consistent (launch from dock, open/close, resize, drag-ready).
- Make future additions easy (`Skills`, `Comms`, `Settings`, `Profile`, and upcoming tools).
- Support larger game UI complexity with predictable layering and positioning.

## Recommended Structure

### 1) Introduce a `UiShell` Layer

Create a single top-level UI shell that owns:

- global z-index tiers
- bottom-left dock launchers
- panel registration/configuration
- panel open/close state persistence

Suggested files:

- `src/modules/ui/UiShell.jsx`
- `src/modules/ui/stores/useUiLayoutStore.js`
- `src/modules/ui/config/panelRegistry.js`

### 2) Panel Registry

Define all panels in a registry so new panels only need one config entry.

Each panel config should include:

- `id` (`comms`, `skills`, `settings`, `profile`)
- `title`
- `launcher` metadata (label, icon, dock order)
- default bounds (`x`, `y`, `width`, `height`)
- min/max constraints
- docking preference (`bottom-left`, future `right-stack`, etc.)
- resize edges allowed

### 3) Shared Panel Primitive

Create one reusable `HudPanel` component with:

- common frame and visual style
- optional header actions
- resize handles (corner/edge variants)
- optional drag behavior
- scroll-safe content area

Then `CommsPanel`, `SkillsPanel`, `SettingsPanel`, and `ProfilePanel` render only their content, not window behavior.

### 4) Dock + Layout Zones

Define explicit screen zones for maintainability with resizable windows:

- **Bottom-left dock**: launchers (`Comms`, `Skills`, `Settings`, `Profile`)
- **Left stack zone**: utility panels that can expand upward/right
- **Right side zone**: future inventory/quest logs
- **Top strip**: notifications/system status

Use collision rules to avoid major overlap for default positions.

### 5) Persistence and Extensibility

Persist layout in local storage:

- open/closed state
- size
- position
- last dock slot/order

This makes iterative UI tuning non-breaking as game complexity grows.

## Immediate Next Steps

1. Extract shared resize logic from `CommsOverlay` and `RpgHud` into a reusable hook (`usePanelResize`).
2. Add panel registry + dock component.
3. Migrate `Comms` and `Skills` to `HudPanel`.
4. Add placeholder `Settings` and `Profile` panels using the same primitive.
5. Add e2e smoke test to verify launchers and resize interactions.
