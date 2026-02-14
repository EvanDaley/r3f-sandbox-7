# Networking notes from `r3f-sandbox-5-main`

## Screens inventory (network-focused)
- `connectPage` is the explicit join flow scene with `ConnectPageOverlay` rendering peer id + welcome modal.  
- Movement/network sandboxes: `movementSandbox1`, `movementSandbox2`, `movementSandbox3`, `movementSandbox4`.  
- Other networking scenes: `chatV1`, `activitySandbox`, `gravitySandbox`, `bombGame`.  
- These are all registered through the sandbox-5 scene store (`src/stores/sceneStore.js`).

## Core networking files in sandbox 5
- `modules/networking_focus/general_connection_tooling/initPeer.js`: central PeerJS bootstrap + connection settings to the self-hosted peer server.
- `.../hooks/usePeerConnection.js`: app-level init hook exposing connect + scene sync helpers.
- `.../messageBus.js`, `.../broadcastMessage.js`, and `.../routeMessage.js`: network message routing/broadcast infrastructure.
- `.../stores/peerStore.js`: shared connection/identity state.
- `connect_page/ConnectPageOverlay.js`: splash/join-style entry UI.

## `MoveablePlayersV4` movement/networking behavior
- `MoveablePlayersV4.js` renders local vs remote avatars and smooths remote transforms with frame-based interpolation (`REMOTE_INTERPOLATION_FACTOR`).
- `hooks/useRobotMovementV4.js` computes keyboard movement and throttles transform broadcasts.
- `hooks/useNetworkedPlayerV4.js` handles host rebroadcast behavior, transform updates, and initial player list sync.

## How this informed the new sandbox-7 module
- Reused the same `initPeer` connection target + ICE server settings to keep compatibility with your existing self-hosted server.
- Split initialization by environment (`initLocalhostPeer` and `initHostedPeer`) for cleaner extension points.
- Added a single peer singleton (`core/initPeer.js`) and a dedicated networking store/hook gateway so future systems (chat/video/interactions) can share one connection source of truth.
