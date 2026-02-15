import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkingStore } from "../stores/useNetworkingStore";
import { useVoiceChat } from "../hooks/useVoiceChat";

const overlayStyles = {
  launcher: {
    position: "fixed",
    left: 12,
    bottom: 18,
    zIndex: 55,
    border: "1px solid rgba(255,255,255,0.24)",
    borderRadius: 999,
    background: "linear-gradient(135deg, rgba(50,70,255,0.85), rgba(82,129,255,0.75))",
    boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    padding: "9px 12px",
    cursor: "pointer",
    backdropFilter: "blur(6px)",
  },
  root: {
    position: "fixed",
    left: 12,
    bottom: 68,
    width: 980,
    maxWidth: "calc(100vw - 24px)",
    height: "min(640px, calc(100vh - 120px))",
    zIndex: 55,
    background: "rgba(8, 10, 19, 0.94)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    color: "white",
    display: "grid",
    gridTemplateColumns: "2fr minmax(280px, 1fr)",
    overflow: "hidden",
    boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  stage: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    minHeight: 0,
    borderRight: "1px solid rgba(255,255,255,0.12)",
  },
  videoArea: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "minmax(0, 2fr) minmax(132px, 1fr)",
    gap: 10,
    padding: 12,
  },
  featuredTile: {
    borderRadius: 12,
    background: "#06070d",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.16)",
    minHeight: 220,
    position: "relative",
  },
  videoGrid: {
    minHeight: 0,
    overflow: "auto",
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    alignContent: "start",
  },
  tile: {
    borderRadius: 12,
    background: "#07080e",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    minHeight: 110,
    position: "relative",
    cursor: "pointer",
  },
  tileMeta: {
    position: "absolute",
    left: 8,
    bottom: 8,
    padding: "4px 8px",
    borderRadius: 999,
    fontSize: 11,
    background: "rgba(0,0,0,0.55)",
    border: "1px solid rgba(255,255,255,0.24)",
  },
  controlsBar: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    padding: 10,
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    alignItems: "center",
    background: "rgba(0,0,0,0.24)",
  },
  rightPanel: {
    minHeight: 0,
    display: "grid",
    gridTemplateRows: "auto 1fr",
  },
  sectionTitle: {
    margin: 0,
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    fontSize: 13,
    fontWeight: 700,
  },
  participants: {
    padding: "8px 12px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    fontSize: 12,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
};

function VideoTile({ label, subtitle, stream, muted, onClick, isActive, style }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    if (stream) {
      videoElement.srcObject = stream;
      videoElement.play().catch((err) => {
        console.warn("[comms] video play failed", { label, err });
      });
    } else {
      videoElement.srcObject = null;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [label, stream, subtitle]);

  return (
    <div
      style={{
        ...overlayStyles.tile,
        ...(style || {}),
        border: isActive ? "1px solid rgba(101,149,255,0.9)" : (style?.border || overlayStyles.tile.border),
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick?.();
        }
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: "16 / 9" }}
      />
      <div style={overlayStyles.tileMeta}>
        {label}
        {subtitle ? ` • ${subtitle}` : ""}
      </div>
    </div>
  );
}

function controlButtonStyle({ danger = false, disabled = false, active = false } = {}) {
  return {
    borderRadius: 999,
    border: `1px solid ${danger ? "rgba(255,98,98,0.5)" : "rgba(255,255,255,0.24)"}`,
    background: disabled
      ? "rgba(255,255,255,0.08)"
      : active
      ? "rgba(67,117,255,0.8)"
      : danger
      ? "rgba(110,12,12,0.66)"
      : "rgba(255,255,255,0.12)",
    color: "#fff",
    fontSize: 12,
    padding: "8px 10px",
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

export default function CommsOverlay() {
  const peer = useNetworkingStore((state) => state.peer);
  const peerId = useNetworkingStore((state) => state.peerId);
  const activeConnections = useNetworkingStore((state) => state.activeConnections);
  const displayName = useNetworkingStore((state) => state.displayName);

  const [isOpen, setIsOpen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [featuredStream, setFeaturedStream] = useState(null);

  const activeCallsRef = useRef(new Map());
  const streamRef = useRef(null);

  // Get connected peer ID (the other peer)
  const connectedPeerId = Object.keys(activeConnections).find(
    (id) => id !== peerId && id
  );

  const connectedPeerIds = Object.keys(activeConnections).filter((id) => id !== peerId);

  // Voice chat hook
  const {
    isInVoiceChat,
    isMuted,
    voiceError,
    remoteAudioStreams,
    startVoiceChat,
    stopVoiceChat,
    toggleMute,
  } = useVoiceChat(peer, connectedPeerIds);

  // Cleanup function for streams
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.onended = null;
      });
      streamRef.current = null;
    }
    setLocalStream(null);
    setIsSharing(false);
  }, []);

  // Cleanup function for calls
  const cleanupCalls = useCallback(() => {
    activeCallsRef.current.forEach((call) => {
      try {
        call.close();
      } catch (err) {
        console.warn("[comms] error closing call", err);
      }
    });
    activeCallsRef.current.clear();
  }, []);

  // Start screensharing
  const startScreenShare = useCallback(async () => {
    if (!peer || !connectedPeerId) {
      setError("Not connected to another peer. Please wait for connection.");
      return;
    }

    try {
      setError("");

      // Request screen share with modern constraints
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Check if we got a video track
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop());
        setError("No video track available from screen share.");
        return;
      }

      // Handle track ending (user stops sharing via browser UI)
      videoTrack.onended = () => {
        console.log("[comms] screen share ended by user");
        stopScreenShare();
      };

      streamRef.current = stream;
      setLocalStream(stream);
      setIsSharing(true);

      // Create call to connected peer
      const call = peer.call(connectedPeerId, stream, {
        metadata: { type: "screenshare" },
      });

      if (!call) {
        throw new Error("Failed to create peer call");
      }

      activeCallsRef.current.set(connectedPeerId, call);

      // Handle incoming stream from peer (bidirectional)
      call.on("stream", (remoteStream) => {
        console.log("[comms] received remote stream", remoteStream.id);
        setRemoteStream(remoteStream);
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[comms] call error", err);
        setError(`Connection error: ${err.message || "Unknown error"}`);
        cleanupCalls();
      });

      // Handle call close
      call.on("close", () => {
        console.log("[comms] call closed");
        activeCallsRef.current.delete(connectedPeerId);
        setRemoteStream(null);
      });
    } catch (err) {
      console.error("[comms] start screen share error", err);
      
      let errorMessage = "Failed to start screen share.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Screen share permission was denied. Please allow access.";
      } else if (err.name === "NotFoundError" || err.name === "NotReadableError") {
        errorMessage = "Screen share is not available. Check your display settings.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      cleanupStream();
    }
  }, [peer, connectedPeerId, cleanupStream, cleanupCalls]);

  // Stop screensharing
  const stopScreenShare = useCallback(() => {
    cleanupCalls();
    cleanupStream();
    setRemoteStream(null);
  }, [cleanupCalls, cleanupStream]);

  // Handle incoming calls
  useEffect(() => {
    if (!peer) return;

    const handleCall = (call) => {
      const callType = call.metadata?.type;
      
      // Only handle screenshare calls
      if (callType !== "screenshare") {
        console.log("[comms] ignoring non-screenshare call", callType);
        return;
      }

      console.log("[comms] incoming screenshare call from", call.peer);

      // Answer the call (we can answer with null if we're not sharing)
      call.answer(localStream || null);

      // Store the call
      activeCallsRef.current.set(call.peer, call);

      // Handle incoming stream
      call.on("stream", (remoteStream) => {
        console.log("[comms] received remote stream from call", remoteStream.id);
        setRemoteStream(remoteStream);
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[comms] incoming call error", err);
        activeCallsRef.current.delete(call.peer);
        setRemoteStream(null);
      });

      // Handle call close
      call.on("close", () => {
        console.log("[comms] incoming call closed");
        activeCallsRef.current.delete(call.peer);
        setRemoteStream(null);
      });
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer, localStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCalls();
      cleanupStream();
    };
  }, [cleanupCalls, cleanupStream]);

  // Cleanup remote stream when connection is lost
  useEffect(() => {
    if (!connectedPeerId && remoteStream) {
      setRemoteStream(null);
      cleanupCalls();
    }
  }, [connectedPeerId, remoteStream, cleanupCalls]);

  // Determine which stream to show in featured tile
  const featuredStreamToShow = featuredStream || remoteStream || localStream;
  const featuredLabel = featuredStream 
    ? `Remote (${connectedPeerId?.slice(0, 8)}...)`
    : remoteStream
    ? `Remote (${connectedPeerId?.slice(0, 8)}...)`
    : localStream
    ? "You"
    : null;

  // Available streams for the grid
  const gridStreams = [];
  if (localStream && !featuredStream) {
    gridStreams.push({ stream: localStream, label: "You", subtitle: "Screen" });
  }
  if (remoteStream && remoteStream !== featuredStream) {
    gridStreams.push({ stream: remoteStream, label: connectedPeerId?.slice(0, 8) || "Remote", subtitle: "Screen" });
  }

  const canShare = connectedPeerId && peer && !isSharing;

  return (
    <>
      <button type="button" style={overlayStyles.launcher} onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "Hide Comms" : "Open Comms"} ({connectedPeerIds.length + 1})
      </button>

      {isOpen && (
        <div style={overlayStyles.root}>
          <section style={overlayStyles.stage}>
            <div style={overlayStyles.videoArea}>
              <div style={overlayStyles.featuredTile}>
                {featuredStreamToShow ? (
                  <VideoTile
                    stream={featuredStreamToShow}
                    muted={featuredStreamToShow === localStream}
                    label={featuredLabel}
                    subtitle="Screen Share"
                    onClick={() => setFeaturedStream(null)}
                    isActive
                    style={overlayStyles.featuredTile}
                  />
                ) : (
                  <div style={{ height: "100%", display: "grid", placeItems: "center", opacity: 0.65, fontSize: 13 }}>
                    Click "Start Sharing" to share your screen
                  </div>
                )}
              </div>

              <div style={overlayStyles.videoGrid}>
                {gridStreams.length === 0 && (
                  <div style={{ opacity: 0.65, fontSize: 12, padding: "6px 4px" }}>
                    Remote feeds will appear here when another participant shares their screen.
                  </div>
                )}
                {gridStreams.map((item, idx) => (
                  <VideoTile
                    key={idx}
                    stream={item.stream}
                    muted={item.stream === localStream}
                    label={item.label}
                    subtitle={item.subtitle}
                    onClick={() => setFeaturedStream(item.stream === remoteStream ? remoteStream : null)}
                    isActive={featuredStream === item.stream}
                  />
                ))}
              </div>
            </div>

            <div style={overlayStyles.controlsBar}>
              {(error || voiceError) && (
                <div style={{ width: "100%", color: "#ffb4b4", fontSize: 12, lineHeight: 1.35 }}>
                  {error || voiceError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
                {!isSharing ? (
                  <button
                    type="button"
                    style={controlButtonStyle({ active: false })}
                    onClick={startScreenShare}
                    disabled={!canShare}
                  >
                    Start Sharing
                  </button>
                ) : (
                  <button type="button" style={controlButtonStyle({ danger: true })} onClick={stopScreenShare}>
                    Stop Sharing
                  </button>
                )}
                {!isInVoiceChat ? (
                  <button
                    type="button"
                    style={controlButtonStyle({ active: false, disabled: connectedPeerIds.length === 0 })}
                    onClick={startVoiceChat}
                    disabled={connectedPeerIds.length === 0 || !peer}
                  >
                    Join Voice
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      style={controlButtonStyle({ active: !isMuted })}
                      onClick={toggleMute}
                    >
                      {isMuted ? "🔇 Muted" : "🎤 Unmuted"}
                    </button>
                    <button type="button" style={controlButtonStyle({ danger: true })} onClick={stopVoiceChat}>
                      Leave Voice
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside style={overlayStyles.rightPanel}>
            <h3 style={overlayStyles.sectionTitle}>Participants</h3>
            <div style={overlayStyles.participants}>
              <div><strong>Total:</strong> {connectedPeerIds.length + 1}</div>
              <div>
                You: {displayName || peerId || "connecting..."}
                {isInVoiceChat && (
                  <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>
                    {isMuted ? "🔇" : "🎤"}
                  </span>
                )}
              </div>
              {connectedPeerIds.map((id) => (
                <div key={id}>
                  • {id}
                  {remoteAudioStreams.has(id) && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>🎤</span>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>
                {isSharing ? "Sharing your screen" : "Not sharing"}
                {remoteStream && " • Receiving remote share"}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>
                {isInVoiceChat ? (
                  <>
                    In voice chat {isMuted && "(muted)"}
                    {remoteAudioStreams.size > 0 && ` • ${remoteAudioStreams.size} active speaker${remoteAudioStreams.size > 1 ? "s" : ""}`}
                  </>
                ) : (
                  "Not in voice chat"
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
