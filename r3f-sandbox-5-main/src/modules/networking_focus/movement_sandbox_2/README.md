# Movement System Documentation

A networked, client-authoritative movement system with smooth interpolation for multiplayer games using Three.js and React Three Fiber.

## Architecture Overview

The movement system consists of several layers:

1. **Input Layer** - Keyboard input handling
2. **Local Movement** - Direct player control with throttled network broadcasts
3. **Networking Layer** - Message bus communication with host rebroadcasting
4. **State Management** - Zustand store for player transforms
5. **Rendering Layer** - Component-based rendering with interpolation
6. **Camera System** - Smooth following camera

## Components

### Hooks

#### `useKeyboardMovement(speed = 7)`
Handles WASD keyboard input and computes movement vectors.

**Features:**
- Tracks key states (keydown/keyup)
- Applies 45° isometric rotation to movement (`Math.PI / 4`)
- Clears keys on window blur/tab switch
- Returns `computeMovement(delta)` for frame-based movement

**Returns:**
- `keys` - Ref to current key states
- `direction` - Ref to current movement direction vector
- `computeMovement(delta)` - Function to compute movement vector

#### `useRobotMovement(ref)`
Main hook for controlling the local player.

**Features:**
- Direct keyboard control (authoritative local movement)
- Applies movement directly to mesh ref (no store interpolation)
- Rotates character to face movement direction
- Throttled network broadcasting (100ms intervals)
- Threshold-based broadcasting (only broadcasts meaningful changes)
- Speed: 7 units/second

**Broadcasting Rules:**
- Broadcasts every 100ms when moving (10 updates/sec)
- Only broadcasts if position changed > 0.01 units or rotation > 0.01 radians
- Periodically checks when idle (every 300ms) to maintain sync

**Important:** Local player never interpolates from store data - it has authoritative control.

#### `useNetworkedPlayer(group = "playerMovement")`
Handles all network communication for player transforms.

**Features:**
- Subscribes to transform updates via messageBus
- Host rebroadcasts updates to all clients
- Manages player list syncing (new clients request full list)
- Updates player store on incoming updates
- Exposes `broadcastTransform(position, rotation)` function

**Message Types:**
- `updateTransform` - Player transform update
- `rebroadcastTransform` - Host rebroadcast of transform
- `requestPlayerList` - Client requests full player list
- `playerListResponse` - Host sends full player list

#### `useInitPlayer(group = "playerMovement", areaSize = 5)`
Initializes the local player's spawn position.

**Features:**
- Runs once when peerId becomes available
- Creates random spawn position within `areaSize`
- Broadcasts initial transform immediately
- Prevents respawning if player already exists

### Components

#### `MoveablePlayers1`
Main component that renders all players.

**Features:**
- Renders local player (direct ref control)
- Renders remote players with smooth interpolation
- Exposes local player ref via `onLocalPlayerRef` callback (for camera following)
- Uses active palette from store

**Local Player:**
- Controlled directly by `useRobotMovement`
- Position/rotation managed by ref (not from store)
- No interpolation

**Remote Players:**
- Rendered via `RemotePlayer` component
- Interpolated from store data
- Smooth position and rotation lerping

#### `RemotePlayer`
Component for rendering remote (non-local) players.

**Features:**
- Smooth position interpolation (lerp factor: 0.2)
- Smooth rotation interpolation with shortest-path wrapping
- Updates target when transform changes in store
- Handles rotation wrapping correctly (prevents full 360° spins)

### Stores

#### `usePlayerStore` (Zustand)
Central state management for all players.

**State:**
```typescript
{
  players: {
    [peerId]: { x, y, z, rotation }
  }
}
```

**Methods:**
- `setPlayerTransform(peerId, transform)` - Update player transform
- `removePlayer(peerId)` - Remove player from store
- `resetPlayers()` - Clear all players

## Movement Flow

### Local Player Movement
```
Keyboard Input (WASD)
  ↓
useKeyboardMovement.computeMovement()
  ↓
useRobotMovement (applies directly to mesh ref)
  ↓
Character moves + rotates
  ↓
Throttled/thresholded broadcast
  ↓
useNetworkedPlayer.broadcastTransform()
  ↓
messageBus → Network → Other clients
```

### Remote Player Movement
```
Network Message
  ↓
useNetworkedPlayer (receives updateTransform)
  ↓
Host rebroadcasts to all clients
  ↓
usePlayerStore.setPlayerTransform()
  ↓
MoveablePlayers1 (RemotePlayer component)
  ↓
Smooth interpolation every frame
```

## Network Optimization

The system uses several optimizations to reduce network traffic:

1. **Throttling**: Broadcasts limited to every 100ms (10 updates/sec)
2. **Thresholds**: Only broadcasts if position/rotation changed meaningfully
3. **Host Rebroadcasting**: Host rebroadcasts to avoid client-to-client connections
4. **Player List Syncing**: New clients request full list once on join

## Constants

```javascript
BROADCAST_THROTTLE_MS = 100        // Broadcast every 100ms
POSITION_CHANGE_THRESHOLD = 0.01   // Only broadcast if moved > 0.01 units
ROTATION_CHANGE_THRESHOLD = 0.01   // Only broadcast if rotated > 0.01 radians
REMOTE_INTERPOLATION_FACTOR = 0.2  // Lerp factor for remote players
DEFAULT_SPEED = 7                  // Units per second
ISOMETRIC_ROTATION = Math.PI / 4    // 45° rotation for isometric movement
```

## Camera Integration

The movement system integrates with `OrthoZoomOnlyFollow` camera:

1. `MoveablePlayers1` exposes local player ref via `onLocalPlayerRef` callback
2. `MovementSandbox2` receives ref and passes to camera
3. Camera follows local player position directly (real-time, no stutter)
4. Camera maintains fixed isometric rotation

## Best Practices

1. **Never interpolate local player** - Local player should always use direct ref control
2. **Always throttle broadcasts** - Don't broadcast every frame
3. **Use thresholds** - Only broadcast meaningful changes
4. **Smooth remote players** - Always interpolate remote players from store data
5. **Handle rotation wrapping** - Use shortest path for rotation interpolation

## Troubleshooting

### Stuttering Movement
- Check if local player is accidentally interpolating from store
- Verify camera is following mesh ref directly (not store position)

### Network Lag
- Adjust `BROADCAST_THROTTLE_MS` for more/less frequent updates
- Increase `REMOTE_INTERPOLATION_FACTOR` for snappier remote movement

## Future Improvements

- [ ] Dead reckoning/prediction for smoother remote movement
- [ ] Position validation (bounds checking, anti-cheat)
- [ ] Configurable movement speed per player
- [ ] Support for jumping/vertical movement
- [ ] Collision detection integration

