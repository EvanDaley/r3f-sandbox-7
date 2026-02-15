# Video Sharing Architecture

This document describes how video and audio sharing works in the CommsOverlay component.

## Overview

The video sharing system uses **WebRTC** via **PeerJS** to enable real-time peer-to-peer media streaming. The system supports three distinct types of media sharing:

1. **Screen Share** - Video + audio from screen capture
2. **Camera Share** - Video-only from user's camera (no audio)
3. **Voice Chat** - Audio-only from microphone

Each type uses separate PeerJS calls with metadata to distinguish them, allowing multiple media types to coexist.

## Architecture

### Core Components

- **`CommsOverlay.jsx`** - Main UI component that orchestrates all media sharing
- **`useCameraShare.js`** - Hook for camera video sharing logic
- **`useVoiceChat.js`** - Hook for voice chat audio logic
- **`useNetworkingStore.js`** - Zustand store for peer connection state

### Key Concepts

#### 1. PeerJS Calls

Each media type uses PeerJS calls with metadata to distinguish them:

```javascript
// Screen share call
peer.call(peerId, stream, { metadata: { type: "screenshare" } })

// Camera share call
peer.call(peerId, stream, { metadata: { type: "camerashare" } })

// Voice chat call
peer.call(peerId, stream, { metadata: { type: "voicechat" } })
```

#### 2. Outgoing vs Incoming Calls

**Outgoing calls** are calls you initiate to send your media to others. These are tracked in `outgoingCallsRef` and are closed when you stop sharing.

**Incoming calls** are calls you receive from others. These are answered with your current stream (or null if not sharing) and remain active even if you stop sharing, so you can continue receiving their stream.

**Critical**: When stopping screen share, only outgoing calls are closed. Incoming calls are preserved so remote streams continue to display.

#### 3. Bidirectional Streaming

PeerJS calls are bidirectional - when you call someone, you:
- Send your local stream to them
- Receive their stream back (if they're sharing)

This means each call handles both sending and receiving.

## Screen Share Flow

### Starting Screen Share

1. User clicks "Start Sharing"
2. `startScreenShare()` requests screen capture via `getDisplayMedia()`
3. Creates a PeerJS call to the connected peer with `metadata.type: "screenshare"`
4. Stores call in `activeCallsRef` and marks as outgoing in `outgoingCallsRef`
5. Call's `stream` event handler receives remote stream and sets `remoteStream` state

### Receiving Screen Share

1. PeerJS `call` event fires with incoming call
2. Checks `call.metadata.type === "screenshare"` to filter
3. Answers call with current local stream (or null if not sharing)
4. Stores call in `activeCallsRef` (but NOT in `outgoingCallsRef`)
5. Call's `stream` event handler receives remote stream

### Stopping Screen Share

1. `stopScreenShare()` is called
2. Only closes calls in `outgoingCallsRef` (outgoing calls)
3. Stops local stream tracks
4. Clears local stream state
5. **Does NOT** clear `remoteStream` - it persists if the other person is still sharing

## Camera Share Flow

Camera sharing is handled by the `useCameraShare` hook and works similarly to screen share, but:

- Uses `getUserMedia()` with `audio: false` (video-only)
- Supports multiple peers (creates calls to all `connectedPeerIds`)
- Stores remote streams in a `Map<peerId, stream>` for multiple peers
- Uses `metadata.type: "camerashare"` to distinguish calls

### Key Differences from Screen Share

1. **Multiple peers**: Creates calls to all connected peers, not just one
2. **Video-only**: No audio track (separate voice chat button for audio)
3. **Stream tracking**: Uses `Map` to track multiple remote camera streams by peer ID
4. **Auto-connect**: When already sharing and a new peer connects, automatically creates a call to them

## Voice Chat Flow

Voice chat is handled by the `useVoiceChat` hook and:

- Uses `getUserMedia()` with `video: false` (audio-only)
- Supports multiple peers
- Includes mute/unmute functionality
- Uses `metadata.type: "voicechat"` to distinguish calls
- Audio streams are played via hidden `<audio>` elements (not video elements)

### Mute/Unmute

Muting works by enabling/disabling the audio track:

```javascript
audioTrack.enabled = !isMuted;
```

The stream continues, but the track is disabled so no audio is transmitted.

## Stream Display

### Featured Video

One stream can be "featured" - displayed in a large area at the top. Users click thumbnails to set the featured stream.

### Thumbnail Grid

All active streams (local and remote, screen and camera) are displayed as thumbnails in a scrollable grid. Thumbnails remain visible even when featured.

### Stream Aggregation

The `gridStreams` array collects all streams for display:

```javascript
const gridStreams = [];

// Add local screen share
if (localStream) {
  gridStreams.push({ stream: localStream, label: "You", subtitle: "Screen", type: "screen" });
}

// Add remote screen share
if (remoteStream) {
  gridStreams.push({ stream: remoteStream, label: peerId, subtitle: "Screen", type: "screen" });
}

// Add local camera
if (localCameraStream) {
  gridStreams.push({ stream: localCameraStream, label: "You", subtitle: "Camera", type: "camera" });
}

// Add remote cameras (from Map)
remoteCameraStreams.forEach((stream, peerId) => {
  gridStreams.push({ stream, label: peerId, subtitle: "Camera", type: "camera" });
});
```

## State Management

### Local State (CommsOverlay)

- `localStream` - Your screen share stream
- `remoteStream` - Remote screen share stream (from one peer)
- `isSharing` - Whether you're currently screen sharing
- `featuredStream` - Which stream is featured in the large view
- `isFeaturedVideoVisible` - Whether featured video section is shown
- `isThumbnailsVisible` - Whether thumbnail grid is shown

### Hook State (useCameraShare)

- `localCameraStream` - Your camera stream
- `remoteCameraStreams` - Map of remote camera streams by peer ID
- `isSharingCamera` - Whether you're currently sharing camera

### Hook State (useVoiceChat)

- `remoteAudioStreams` - Map of remote audio streams by peer ID
- `isInVoiceChat` - Whether you're in voice chat
- `isMuted` - Whether you're muted

## Call Lifecycle

### Outgoing Call Lifecycle

1. **Create**: `peer.call(peerId, stream, { metadata })`
2. **Store**: Add to `activeCallsRef` and `outgoingCallsRef`
3. **Listen**: Set up `stream`, `error`, `close` handlers
4. **Receive**: Handle `stream` event to get remote stream
5. **Close**: When stopping, close call and remove from refs

### Incoming Call Lifecycle

1. **Receive**: PeerJS `call` event fires
2. **Filter**: Check `metadata.type` matches expected type
3. **Answer**: `call.answer(localStream || null)`
4. **Store**: Add to `activeCallsRef` (but NOT `outgoingCallsRef`)
5. **Listen**: Set up `stream`, `error`, `close` handlers
6. **Receive**: Handle `stream` event to get remote stream
7. **Persist**: Call remains active even if you stop sharing

## Important Patterns

### Preventing Re-answering

Incoming call handlers check if a call already exists:

```javascript
if (activeCallsRef.current.has(call.peer)) {
  console.log("already have incoming call from", call.peer);
  return; // Don't re-answer
}
```

### Using Refs for Streams

Streams are stored in refs (`streamRef`, `cameraStreamRef`) to avoid stale closures in event handlers:

```javascript
const streamRef = useRef(null);

// Later in handler
call.answer(streamRef.current || null);
```

### Track Cleanup

Always stop tracks when cleaning up:

```javascript
stream.getTracks().forEach((track) => {
  track.stop();
  track.onended = null;
});
```

### Handling Track Ending

Media tracks can end (user stops sharing, device disconnects):

```javascript
videoTrack.onended = () => {
  console.log("track ended");
  stopScreenShare();
};
```

## UI Features

### Resizable Panel

The comms panel is resizable with a drag handle. Panel size is stored in `panelSize` state.

### Featured Video Toggle

Featured video section can be shown/hidden. When toggled, panel height adjusts by ±400px.

### Thumbnail Toggle

Thumbnail grid can be shown/hidden via button. When hidden, button highlights to indicate thumbnails can be restored.

### Dynamic Height Adjustment

When featured video is toggled, panel height adjusts:

```javascript
const heightDelta = isFeaturedVideoVisible ? FEATURED_VIDEO_HEIGHT : -FEATURED_VIDEO_HEIGHT;
```

## Common Issues & Solutions

### Issue: Remote stream goes black when local user stops sharing

**Cause**: Closing all calls (including incoming) when stopping.

**Solution**: Only close outgoing calls. Preserve incoming calls so remote streams continue.

### Issue: Maximum update depth exceeded

**Cause**: `useEffect` dependencies causing infinite loops (e.g., array recreations).

**Solution**: Use refs for mutable values, compare Sets/Arrays properly, only update state when values actually change.

### Issue: Duplicate calls being created

**Cause**: `useEffect` running multiple times or not checking for existing calls.

**Solution**: Check `activeCallsRef` before creating/answering calls, use refs to track previous state.

## File Structure

```
src/modules/networking/
├── components/
│   └── CommsOverlay.jsx          # Main UI component
├── hooks/
│   ├── useCameraShare.js         # Camera sharing logic
│   └── useVoiceChat.js           # Voice chat logic
├── stores/
│   └── useNetworkingStore.js     # Peer connection state
└── config/
    └── networkConfig.js          # PeerJS server config
```

## Key Dependencies

- **PeerJS** - WebRTC peer-to-peer library
- **React** - UI framework
- **Zustand** - State management
- **WebRTC APIs** - `getUserMedia`, `getDisplayMedia`
