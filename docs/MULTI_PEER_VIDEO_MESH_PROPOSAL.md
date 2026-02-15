# Proposal: Multi-peer Video Sharing + Late-Join Feed Sync

## Goal

Allow every connected peer to both publish and receive **all active video feeds** (screen + camera), not just host-directed screen sharing. When a new participant joins, they should automatically receive every currently live feed without requiring current sharers to manually restart.

## Current behavior and root cause

The existing screen-sharing path in `CommsOverlay` is effectively one-to-one:

- It selects a single `connectedPeerId` from `activeConnections`.  
- It starts screen-share calls only to that one peer.  
- It stores only one remote screen stream (`remoteStream`) instead of per-peer stream state.

Camera and voice already support multi-peer fan-out and late-join auto-connect patterns by:

- Calling all `connectedPeerIds`.
- Maintaining `Map<peerId, stream>` state.
- Auto-initiating calls for newly connected peers while sharing.

## Proposed architecture

### 1) Extract screen share into a dedicated multi-peer hook

Create `useScreenShare(peer, connectedPeerIds)` patterned after `useCameraShare`.

**Responsibilities:**

- Manage local screen stream lifecycle (`getDisplayMedia`, track end handling, cleanup).
- Track screen calls in `Map<peerId, call>`.
- Track remote screen streams in `Map<peerId, MediaStream>`.
- Distinguish call type via `metadata.type = "screenshare"`.
- Handle incoming calls with duplicate-call guards.
- Auto-create calls to newly connected peers while sharing.
- Cleanup calls/streams when peers disconnect.

This replaces the `connectedPeerId` single-target logic.

### 2) Use per-peer stream maps for UI rendering

Replace `remoteStream` with `remoteScreenStreams: Map<peerId, MediaStream>` in the screen-share hook and in `CommsOverlay` usage.

UI aggregation should merge:

- `localScreenStream`
- all `remoteScreenStreams`
- `localCameraStream`
- all `remoteCameraStreams`

This enables multiple simultaneous remote screens in thumbnails/featured mode.

### 3) Late joiner sync (automatic backfill)

No extra signaling protocol is required if sharers proactively call newly connected peers.

When `connectedPeerIds` changes while `isSharingScreen === true`:

1. Diff previous and current peer sets.
2. For each newly connected peer not already called, initiate `peer.call(peerId, screenStream, { metadata: { type: "screenshare" }})`.
3. Attach standard `stream/error/close` handlers.

This mirrors existing camera/voice behavior and gives late joiners all currently active feeds as calls are established.

### 4) Keep host as topology coordinator only (not media relay)

Continue using the host-centered data connection topology for control/state, but keep media P2P among clients. Each sharing peer fans out directly to all connected peers. This avoids adding an SFU/MCU backend now while meeting feature goals.

## Suggested implementation plan

### Phase 1 — Screen-share parity with camera hook

1. Add `src/modules/networking/hooks/useScreenShare.js`.
2. Move screen-sharing logic from `CommsOverlay` into the hook.
3. Swap `remoteStream` usage for `remoteScreenStreams` map.
4. Update featured/grid selection logic to include all remote screens.

### Phase 2 — Robustness hardening

1. Add call dedupe keys per `(peerId, type)` to prevent duplicate answer loops.
2. Normalize cleanup paths (error, close, peer disconnect, unmount).
3. Add guardrails for permissions and browser track-end scenarios.

### Phase 3 — UX and diagnostics

1. Show per-peer feed labels (`displayName` when available).
2. Add lightweight telemetry logs for call start/close/error counts.
3. Expose “N active feeds” and “late-join sync complete” status text.

## Data model and API sketch

```js
// useScreenShare return shape
{
  isSharingScreen,
  screenError,
  localScreenStream,
  remoteScreenStreams, // Map<peerId, MediaStream>
  startScreenShare,
  stopScreenShare,
}
```

```js
// CommsOverlay usage
const {
  isSharingScreen,
  screenError,
  localScreenStream,
  remoteScreenStreams,
  startScreenShare,
  stopScreenShare,
} = useScreenShare(peer, connectedPeerIds);
```

## Acceptance criteria

1. If A, B, C are connected and A shares screen, both B and C receive A’s screen.
2. If B and C also share camera/screen, A sees both streams simultaneously.
3. If D joins late while A/B/C are actively sharing, D receives all active feeds without anyone restarting share.
4. If any sharer stops, only that sharer’s feed is removed; other feeds remain.
5. Reconnect/disconnect events do not create duplicate persistent ghost streams.

## Risks and tradeoffs

- **Mesh scaling cost:** Full mesh media fan-out grows with participant count; CPU and uplink usage increase quickly.
- **Browser call limits:** Too many concurrent streams may degrade quality.
- **No central adaptation:** Without SFU, bandwidth adaptation is limited.

For small rooms, this is the fastest path with minimal architectural change. If larger rooms are planned, add an SFU roadmap item (e.g., mediasoup/LiveKit) after this mesh upgrade.

## Test plan (post-implementation)

1. Manual matrix in 4-browser session: start/stop screen + camera from each peer.
2. Late-join scenario: keep 2–3 sharers active, join a new peer, verify all feeds appear.
3. Churn scenario: rapid peer connect/disconnect while sharing.
4. Verify no leaked tracks/calls after stop/unmount via console instrumentation.
5. Confirm voice and camera hooks continue to interoperate with screen calls via metadata filtering.
