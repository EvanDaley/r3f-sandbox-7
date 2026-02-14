# 🎮 PeerJS Hub-and-Spoke Architecture

This diagram shows the **hub-and-spoke** multiplayer architecture used in this project.

The **host** acts as the authoritative peer — it keeps the player list and world state synchronized.
All **clients** connect only to the host via PeerJS. Clients send movement updates, and the host rebroadcasts the updated player list to everyone.

```mermaid
flowchart TD
  %% ===========
  %% STRUCTURE
  %% ===========

  subgraph ClientA["Client A"]
    A1["NetworkSystem - connects to host"]
    A2["worldStore - replica from host"]
    A3["R3F Scene - renders players"]
    A1 --> A2 --> A3
  end

  subgraph ClientB["Client B"]
    B1["NetworkSystem - connects to host"]
    B2["worldStore - replica from host"]
    B3["R3F Scene - renders players"]
    B1 --> B2 --> B3
  end

  subgraph Host["Host - Authoritative Peer"]
    H1["NetworkSystem - PeerJS server and broadcaster"]
    H2["worldStore - authoritative player list"]
    H3["R3F Scene - renders shared world"]
    H1 --> H2 --> H3
  end

  %% ===========
  %% CONNECTIONS
  %% ===========
  A1 -.->|"connects via PeerJS"| H1
  B1 -.->|"connects via PeerJS"| H1

  %% Data Flow
  A1 -->|"join / move"| H1
  B1 -->|"join / move"| H1
  H1 -->|"player_list broadcast"| A1
  H1 -->|"player_list broadcast"| B1
