import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useScreenShare - Multi-peer screen sharing via WebRTC/PeerJS
 *
 * Features:
 * - Fan-out calls to all currently connected peers
 * - Remote streams tracked per peer (Map<peerId, MediaStream>)
 * - Late-join sync: auto-call newly connected peers while sharing
 * - Incoming call handling with duplicate guards
 */
export function useScreenShare(peer, connectedPeerIds) {
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [screenError, setScreenError] = useState("");
  const [remoteScreenStreams, setRemoteScreenStreams] = useState(new Map());

  const screenStreamRef = useRef(null);
  const screenCallsRef = useRef(new Map());
  const previousPeerIdsRef = useRef(new Set());
  const previousConnectedPeerIdsRef = useRef(new Set());
  const initiatedCallsRef = useRef(new Set());

  const cleanupScreenStream = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.onended = null;
      });
      screenStreamRef.current = null;
    }

    setIsSharingScreen(false);
  }, []);

  const cleanupScreenCalls = useCallback(() => {
    screenCallsRef.current.forEach((call) => {
      try {
        call.close();
      } catch (err) {
        console.warn("[screen] error closing screen call", err);
      }
    });

    screenCallsRef.current.clear();
  }, []);

  const bindCallHandlers = useCallback((call, peerId) => {
    call.on("stream", (remoteStream) => {
      console.log("[screen] received remote screen stream from", peerId);
      setRemoteScreenStreams((prev) => {
        if (prev.get(peerId) === remoteStream) {
          return prev;
        }

        const next = new Map(prev);
        next.set(peerId, remoteStream);
        return next;
      });
    });

    call.on("error", (err) => {
      console.error("[screen] call error for", peerId, err);
      screenCallsRef.current.delete(peerId);
      initiatedCallsRef.current.delete(peerId);
      setRemoteScreenStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    });

    call.on("close", () => {
      console.log("[screen] call closed for", peerId);
      screenCallsRef.current.delete(peerId);
      initiatedCallsRef.current.delete(peerId);
      setRemoteScreenStreams((prev) => {
        const next = new Map(prev);
        next.delete(peerId);
        return next;
      });
    });
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!peer || connectedPeerIds.length === 0) {
      setScreenError("Not connected to any peers. Please wait for connection.");
      return;
    }

    try {
      setScreenError("");

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

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop());
        setScreenError("No video track available from screen share.");
        return;
      }

      videoTrack.onended = () => {
        console.log("[screen] video track ended");
        stopScreenShare();
      };

      screenStreamRef.current = stream;
      setIsSharingScreen(true);
      initiatedCallsRef.current.clear();

      const callPromises = connectedPeerIds.map(async (peerId) => {
        try {
          const call = peer.call(peerId, stream, {
            metadata: { type: "screenshare" },
          });

          if (!call) {
            throw new Error(`Failed to create screen call to ${peerId}`);
          }

          screenCallsRef.current.set(peerId, call);
          initiatedCallsRef.current.add(peerId);
          bindCallHandlers(call, peerId);
        } catch (err) {
          console.error("[screen] error creating call to", peerId, err);
          initiatedCallsRef.current.delete(peerId);
        }
      });

      await Promise.allSettled(callPromises);
    } catch (err) {
      console.error("[screen] start screen share error", err);

      let errorMessage = "Failed to start screen share.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Screen share permission was denied. Please allow access.";
      } else if (err.name === "NotFoundError" || err.name === "NotReadableError") {
        errorMessage = "Screen share is not available. Check your display settings.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setScreenError(errorMessage);
      cleanupScreenStream();
    }
  }, [peer, connectedPeerIds, bindCallHandlers, cleanupScreenStream]);

  const stopScreenShare = useCallback(() => {
    cleanupScreenCalls();
    cleanupScreenStream();
    initiatedCallsRef.current.clear();
    previousPeerIdsRef.current.clear();
    previousConnectedPeerIdsRef.current.clear();
  }, [cleanupScreenCalls, cleanupScreenStream]);

  useEffect(() => {
    if (!peer) return;

    const handleCall = (call) => {
      if (call.metadata?.type !== "screenshare") {
        return;
      }

      if (screenCallsRef.current.has(call.peer)) {
        return;
      }

      console.log("[screen] incoming screen call from", call.peer);
      call.answer(screenStreamRef.current || null);
      screenCallsRef.current.set(call.peer, call);
      bindCallHandlers(call, call.peer);
    };

    peer.on("call", handleCall);
    return () => {
      peer.off("call", handleCall);
    };
  }, [peer, bindCallHandlers]);

  useEffect(() => {
    if (!peer || !isSharingScreen || !screenStreamRef.current) {
      initiatedCallsRef.current.clear();
      previousConnectedPeerIdsRef.current.clear();
      return;
    }

    const currentPeerIds = new Set(connectedPeerIds);
    const previousPeerIds = previousConnectedPeerIdsRef.current;

    const peerListChanged =
      currentPeerIds.size !== previousPeerIds.size ||
      [...currentPeerIds].some((id) => !previousPeerIds.has(id)) ||
      [...previousPeerIds].some((id) => !currentPeerIds.has(id));

    if (!peerListChanged) {
      return;
    }

    const existingCallPeerIds = new Set(screenCallsRef.current.keys());
    const initiatedPeerIds = initiatedCallsRef.current;
    const newPeers = connectedPeerIds.filter(
      (peerId) => !existingCallPeerIds.has(peerId) && !initiatedPeerIds.has(peerId)
    );

    if (newPeers.length === 0) {
      previousConnectedPeerIdsRef.current = currentPeerIds;
      return;
    }

    newPeers.forEach((peerId) => initiatedPeerIds.add(peerId));

    newPeers.forEach(async (peerId) => {
      try {
        const call = peer.call(peerId, screenStreamRef.current, {
          metadata: { type: "screenshare" },
        });

        if (!call) {
          initiatedPeerIds.delete(peerId);
          return;
        }

        screenCallsRef.current.set(peerId, call);
        bindCallHandlers(call, peerId);
      } catch (err) {
        console.error("[screen] error creating call to new peer", peerId, err);
        initiatedPeerIds.delete(peerId);
      }
    });

    previousConnectedPeerIdsRef.current = currentPeerIds;
  }, [peer, connectedPeerIds, isSharingScreen, bindCallHandlers]);

  useEffect(() => {
    if (!isSharingScreen) {
      previousPeerIdsRef.current = new Set();
      return;
    }

    const currentPeerIds = new Set(connectedPeerIds);
    const previousPeerIds = previousPeerIdsRef.current;

    const hasChanged =
      currentPeerIds.size !== previousPeerIds.size ||
      [...currentPeerIds].some((id) => !previousPeerIds.has(id)) ||
      [...previousPeerIds].some((id) => !currentPeerIds.has(id));

    if (!hasChanged) {
      return;
    }

    screenCallsRef.current.forEach((call, peerId) => {
      if (!currentPeerIds.has(peerId)) {
        try {
          call.close();
        } catch (err) {
          console.warn("[screen] error closing call for disconnected peer", err);
        }

        screenCallsRef.current.delete(peerId);
        initiatedCallsRef.current.delete(peerId);
      }
    });

    setRemoteScreenStreams((prev) => {
      const filtered = new Map();
      let hasChanges = false;

      prev.forEach((stream, peerId) => {
        if (currentPeerIds.has(peerId)) {
          filtered.set(peerId, stream);
        } else {
          hasChanges = true;
        }
      });

      return hasChanges ? filtered : prev;
    });

    previousPeerIdsRef.current = currentPeerIds;
  }, [connectedPeerIds, isSharingScreen]);

  useEffect(() => {
    return () => {
      cleanupScreenCalls();
      cleanupScreenStream();
    };
  }, [cleanupScreenCalls, cleanupScreenStream]);

  return {
    isSharingScreen,
    screenError,
    localScreenStream: screenStreamRef.current,
    remoteScreenStreams,
    startScreenShare,
    stopScreenShare,
  };
}
