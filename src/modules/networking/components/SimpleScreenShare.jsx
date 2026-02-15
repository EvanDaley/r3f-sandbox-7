import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkingStore } from "../stores/useNetworkingStore";

/**
 * SimpleScreenShare - A production-ready screensharing component
 * 
 * Features:
 * - Clean WebRTC screensharing between two peers
 * - Automatic connection management
 * - Proper error handling and user feedback
 * - Modern React patterns with proper cleanup
 */
export default function SimpleScreenShare() {
  const peer = useNetworkingStore((state) => state.peer);
  const peerId = useNetworkingStore((state) => state.peerId);
  const activeConnections = useNetworkingStore((state) => state.activeConnections);
  const role = useNetworkingStore((state) => state.role);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const activeCallsRef = useRef(new Map());
  const streamRef = useRef(null);

  // Get connected peer ID (the other peer)
  const connectedPeerId = Object.keys(activeConnections).find(
    (id) => id !== peerId && id
  );

  // Update connection status
  useEffect(() => {
    if (!peer || !peerId) {
      setConnectionStatus("disconnected");
    } else if (connectedPeerId) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("waiting");
    }
  }, [peer, peerId, connectedPeerId]);

  // Handle local video element
  useEffect(() => {
    const video = localVideoRef.current;
    if (!video) return;

    if (localStream) {
      video.srcObject = localStream;
      video.play().catch((err) => {
        console.warn("[screenshare] local video play failed", err);
      });
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [localStream]);

  // Handle remote video element
  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;

    if (remoteStream) {
      video.srcObject = remoteStream;
      video.play().catch((err) => {
        console.warn("[screenshare] remote video play failed", err);
      });
    } else {
      video.srcObject = null;
    }

    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [remoteStream]);

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
        console.warn("[screenshare] error closing call", err);
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
          displaySurface: "monitor", // Prefer full screen
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
        console.log("[screenshare] screen share ended by user");
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
        console.log("[screenshare] received remote stream", remoteStream.id);
        setRemoteStream(remoteStream);
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[screenshare] call error", err);
        setError(`Connection error: ${err.message || "Unknown error"}`);
        cleanupCalls();
      });

      // Handle call close
      call.on("close", () => {
        console.log("[screenshare] call closed");
        activeCallsRef.current.delete(connectedPeerId);
        setRemoteStream(null);
      });
    } catch (err) {
      console.error("[screenshare] start screen share error", err);
      
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
        console.log("[screenshare] ignoring non-screenshare call", callType);
        return;
      }

      console.log("[screenshare] incoming screenshare call from", call.peer);

      // Answer the call (we can answer with null if we're not sharing)
      call.answer(localStream || null);

      // Store the call
      activeCallsRef.current.set(call.peer, call);

      // Handle incoming stream
      call.on("stream", (remoteStream) => {
        console.log("[screenshare] received remote stream from call", remoteStream.id);
        setRemoteStream(remoteStream);
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[screenshare] incoming call error", err);
        activeCallsRef.current.delete(call.peer);
        setRemoteStream(null);
      });

      // Handle call close
      call.on("close", () => {
        console.log("[screenshare] incoming call closed");
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

  const isConnected = connectionStatus === "connected";
  const canShare = isConnected && peer && !isSharing;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Screen Share</h3>
        <div style={statusStyle}>
          <span style={statusIndicatorStyle(connectionStatus)} />
          {connectionStatus === "connected" && connectedPeerId
            ? `Connected to ${connectedPeerId.slice(0, 8)}...`
            : connectionStatus === "waiting"
            ? "Waiting for connection..."
            : "Disconnected"}
        </div>
      </div>

      {error && (
        <div style={errorStyle}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={videoContainerStyle}>
        <div style={videoWrapperStyle}>
          <div style={videoLabelStyle}>
            {isSharing ? "Your Screen" : "No screen sharing"}
          </div>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={videoStyle}
          />
          {!localStream && (
            <div style={placeholderStyle}>
              Click "Start Sharing" to share your screen
            </div>
          )}
        </div>

        <div style={videoWrapperStyle}>
          <div style={videoLabelStyle}>
            {remoteStream ? "Remote Screen" : "No remote share"}
          </div>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={videoStyle}
          />
          {!remoteStream && (
            <div style={placeholderStyle}>
              Waiting for remote screen share...
            </div>
          )}
        </div>
      </div>

      <div style={controlsStyle}>
        {!isSharing ? (
          <button
            type="button"
            onClick={startScreenShare}
            disabled={!canShare}
            style={buttonStyle(canShare)}
          >
            Start Sharing
          </button>
        ) : (
          <button
            type="button"
            onClick={stopScreenShare}
            style={buttonStyle(true, true)}
          >
            Stop Sharing
          </button>
        )}
      </div>

      <div style={infoStyle}>
        <div>Your ID: {peerId || "Not connected"}</div>
        {connectedPeerId && <div>Connected to: {connectedPeerId}</div>}
        <div>Role: {role || "Unknown"}</div>
      </div>
    </div>
  );
}

// Styles
const containerStyle = {
  position: "fixed",
  top: 20,
  right: 20,
  width: 600,
  maxWidth: "calc(100vw - 40px)",
  background: "rgba(20, 20, 30, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: 12,
  padding: 20,
  color: "#fff",
  fontFamily: "system-ui, -apple-system, sans-serif",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  backdropFilter: "blur(10px)",
  zIndex: 1000,
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const titleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
};

const statusStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: "rgba(255, 255, 255, 0.7)",
};

const statusIndicatorStyle = (status) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  background:
    status === "connected"
      ? "#4ade80"
      : status === "waiting"
      ? "#fbbf24"
      : "#ef4444",
  boxShadow:
    status === "connected"
      ? "0 0 8px rgba(74, 222, 128, 0.5)"
      : status === "waiting"
      ? "0 0 8px rgba(251, 191, 36, 0.5)"
      : "none",
});

const errorStyle = {
  background: "rgba(239, 68, 68, 0.2)",
  border: "1px solid rgba(239, 68, 68, 0.5)",
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
  fontSize: 13,
  color: "#fca5a5",
};

const videoContainerStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginBottom: 16,
};

const videoWrapperStyle = {
  position: "relative",
  background: "#000",
  borderRadius: 8,
  overflow: "hidden",
  aspectRatio: "16 / 9",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const videoLabelStyle = {
  position: "absolute",
  top: 8,
  left: 8,
  background: "rgba(0, 0, 0, 0.7)",
  padding: "4px 8px",
  borderRadius: 4,
  fontSize: 11,
  zIndex: 10,
  fontWeight: 500,
};

const videoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};

const placeholderStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: 12,
  textAlign: "center",
  pointerEvents: "none",
};

const controlsStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: 16,
};

const buttonStyle = (enabled, danger = false) => ({
  padding: "10px 24px",
  fontSize: 14,
  fontWeight: 600,
  borderRadius: 8,
  border: "none",
  cursor: enabled ? "pointer" : "not-allowed",
  background: danger
    ? "rgba(239, 68, 68, 0.8)"
    : enabled
    ? "rgba(59, 130, 246, 0.9)"
    : "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  transition: "all 0.2s",
  opacity: enabled ? 1 : 0.5,
  ...(enabled && !danger && {
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  }),
});

const infoStyle = {
  fontSize: 11,
  color: "rgba(255, 255, 255, 0.6)",
  display: "flex",
  flexDirection: "column",
  gap: 4,
  paddingTop: 12,
  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
};
