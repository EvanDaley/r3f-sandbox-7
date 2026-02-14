# r3f-sandbox-5

## Live Demo

https://evandaley.github.io/r3f-sandbox-5/

## Description

A React Three Fiber app for experimenting with different workflows and rendering techniques.

## Development Commands

Start development server: `npm start` or `npm run dev`

Build for production: `npm run build`

Deploy to GitHub Pages: `npm run ship` (builds and deploys)

## Development Helpers

- For easy development, use `npm run dev:dual` to spin up local servers on 3000 and 3001. 
- The one running on 3000 will use the peer id `host-local-dev`
- The one running on 3001 will use the peer id `client-local-dev`. 
- One second after loading the page, the client will try to create a peer connection to the hardcoded host id. This makes testing much faster. As long as you've got a tab open on each port, you can refresh and they'll automatically find each other. 

## Architecture Overview

This is a React Three Fiber (R3F) application with peer-to-peer networking using PeerJS. The app allows multiple browser tabs to connect and synchronize in a 3D environment.

### Core Architecture Components

**Application Structure:**
- `App.js` renders `HTMLContent` (2D UI overlay) and `ThreeCanvas` (3D scene)
- `ThreeCanvas.js` uses scene store to dynamically render different scene components
- Scenes are managed through `sceneStore.js` with a simple scene switching system

**Networking Layer (PeerJS):**
- `PeerManager.js`: Core P2P connection management, handles peer initialization and connection setup
- `MessageRouter.js`: Routes incoming messages to appropriate handlers based on scene and message type
- `handlers/`: Scene-specific message handlers (currently common.js and scene1.js)
- Host/client roles are automatically determined: incoming connections make you a host, outgoing connections make you a client

**State Management (Zustand):**
- `peerStore.js`: Manages peer connections, IDs, host/client status, and player data
- `sceneStore.js`: Manages current scene and scene transitions
- Both stores use Redux DevTools for debugging (randomized store names to avoid conflicts between tabs)

**Scene System:**
- Scene components are dynamically loaded based on `currentSceneId` in scene store
- `WelcomeScreen.js`: Connection interface with 3D robot model and connection UI
- Scene components can access peer state through `usePeerConnection` hook

### Key Patterns

**Peer Connection Flow:**
1. Each tab initializes a peer with `initPeer()`
2. Users enter peer IDs to connect via `connectToPeer()`
3. Host/client roles are set automatically during connection
4. All connections are stored in peerStore for message routing

**Message Handling:**
- Messages have structure: `{ scene: 'scene1', type: 'messageType', payload: {...} }`
- MessageRouter looks for handlers in `handlers/[scene].js` first, falls back to `handlers/common.js`
- Add new message types by creating handler functions in appropriate handler files

**Development Setup:**
- Uses Redux DevTools for state debugging (open two tabs and connect them)
- Peer IDs are displayed in top-right corner for easy testing
- All peer connections initialize automatically on app load

## Testing

Open two Chrome tabs to test peer connections. One tab becomes the host (receives connections), the other becomes the client (initiates connection). Use the peer ID displayed in the top-right corner to connect between tabs.

## Networking - More Details

My preferred approach right now for adding networked events is to create hooks that:

- Can be attached to any scene
- Determine their own criteria for broadcasting events
- Attach their own handlers to the message bus so they can process their own events on each client
- A good example of this is: TODO (link the cleanest one)

There are also few scenarios to keep in mind when networking:

- Host sending list updates to keep things in sync across players
- Host and/or players triggering events (move here, switch rooms)
- Multiple systems effecting the same piece of data (i.e. gravity + character movement + host updates)
- If a client sends a position to the host, and the host rebroadcasts it, the client should throw out that message to avoid jitter

