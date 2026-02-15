import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useCameraShare - Production-ready hook for managing camera video sharing via WebRTC
 * 
 * Features:
 * - Video stream management from user camera
 * - Separate call handling from screen share and voice chat
 * - Proper cleanup and error handling
 * - Handles multiple peer connections
 */
export function useCameraShare(peer, connectedPeerIds) {
  const [isSharingCamera, setIsSharingCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [remoteCameraStreams, setRemoteCameraStreams] = useState(new Map());

  const cameraStreamRef = useRef(null);
  const cameraCallsRef = useRef(new Map());
  const previousPeerIdsRef = useRef(new Set());
  const previousConnectedPeerIdsRef = useRef(new Set());
  const initiatedCallsRef = useRef(new Set());

  // Cleanup camera stream
  const cleanupCameraStream = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.onended = null;
      });
      cameraStreamRef.current = null;
    }
    setIsSharingCamera(false);
  }, []);

  // Cleanup camera calls
  const cleanupCameraCalls = useCallback(() => {
    cameraCallsRef.current.forEach((call) => {
      try {
        call.close();
      } catch (err) {
        console.warn("[camera] error closing camera call", err);
      }
    });
    cameraCallsRef.current.clear();
  }, []);

  // Start camera share
  const startCameraShare = useCallback(async () => {
    if (!peer || connectedPeerIds.length === 0) {
      setCameraError("Not connected to any peers. Please wait for connection.");
      return;
    }

    try {
      setCameraError("");

      // Request camera access with video-only (no audio - use voice chat for audio)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: "user",
        },
        audio: false,
      });

      // Check if we got a video track
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraError("No video track available from camera.");
        return;
      }

      // Handle track ending (user revokes permission or device disconnects)
      videoTrack.onended = () => {
        console.log("[camera] video track ended");
        stopCameraShare();
      };

      cameraStreamRef.current = stream;
      setIsSharingCamera(true);
      initiatedCallsRef.current.clear();

      // Create camera calls to all connected peers
      const callPromises = connectedPeerIds.map(async (peerId) => {
        try {
          const call = peer.call(peerId, stream, {
            metadata: { type: "camerashare" },
          });

          if (!call) {
            throw new Error(`Failed to create camera call to ${peerId}`);
          }

          cameraCallsRef.current.set(peerId, call);
          initiatedCallsRef.current.add(peerId);

          // Handle incoming stream from peer (bidirectional)
          call.on("stream", (remoteStream) => {
            console.log("[camera] received remote camera stream from", peerId);
            setRemoteCameraStreams((prev) => {
              // Only update if the stream actually changed
              if (prev.get(peerId) === remoteStream) {
                return prev;
              }
              const next = new Map(prev);
              next.set(peerId, remoteStream);
              return next;
            });
          });

          // Handle call errors
          call.on("error", (err) => {
            console.error("[camera] call error for", peerId, err);
            setCameraError(`Camera connection error with ${peerId}: ${err.message || "Unknown error"}`);
            cameraCallsRef.current.delete(peerId);
            initiatedCallsRef.current.delete(peerId);
            setRemoteCameraStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          });

          // Handle call close
          call.on("close", () => {
            console.log("[camera] call closed for", peerId);
            cameraCallsRef.current.delete(peerId);
            initiatedCallsRef.current.delete(peerId);
            setRemoteCameraStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          });
        } catch (err) {
          console.error("[camera] error creating call to", peerId, err);
          initiatedCallsRef.current.delete(peerId);
        }
      });

      await Promise.allSettled(callPromises);
    } catch (err) {
      console.error("[camera] start camera share error", err);

      let errorMessage = "Failed to start camera share.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Camera permission was denied. Please allow access.";
      } else if (err.name === "NotFoundError" || err.name === "NotReadableError") {
        errorMessage = "Camera is not available. Check your camera settings.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setCameraError(errorMessage);
      cleanupCameraStream();
    }
  }, [peer, connectedPeerIds, cleanupCameraStream]);

  // Stop camera share
  const stopCameraShare = useCallback(() => {
    cleanupCameraCalls();
    cleanupCameraStream();
    setRemoteCameraStreams(new Map());
    initiatedCallsRef.current.clear();
    previousPeerIdsRef.current.clear();
    previousConnectedPeerIdsRef.current.clear();
  }, [cleanupCameraCalls, cleanupCameraStream]);

  // Handle incoming camera calls
  useEffect(() => {
    if (!peer) return;

    const handleCall = (call) => {
      const callType = call.metadata?.type;

      // Only handle camerashare calls
      if (callType !== "camerashare") {
        return;
      }

      console.log("[camera] incoming camera call from", call.peer);

      // Answer the call with our camera stream if we're sharing, otherwise answer with null
      call.answer(cameraStreamRef.current || null);

      // Store the call
      cameraCallsRef.current.set(call.peer, call);

      // Handle incoming stream
      call.on("stream", (remoteStream) => {
        console.log("[camera] received remote camera stream from incoming call", call.peer);
        setRemoteCameraStreams((prev) => {
          // Only update if the stream actually changed
          if (prev.get(call.peer) === remoteStream) {
            return prev;
          }
          const next = new Map(prev);
          next.set(call.peer, remoteStream);
          return next;
        });
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[camera] incoming call error", err);
        cameraCallsRef.current.delete(call.peer);
        setRemoteCameraStreams((prev) => {
          const next = new Map(prev);
          next.delete(call.peer);
          return next;
        });
      });

      // Handle call close
      call.on("close", () => {
        console.log("[camera] incoming call closed");
        cameraCallsRef.current.delete(call.peer);
        setRemoteCameraStreams((prev) => {
          const next = new Map(prev);
          next.delete(call.peer);
          return next;
        });
      });
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer]);

  // Automatically create camera calls to newly connected peers when already sharing
  useEffect(() => {
    if (!peer || !isSharingCamera || !cameraStreamRef.current) {
      initiatedCallsRef.current.clear();
      previousConnectedPeerIdsRef.current.clear();
      return;
    }

    const currentPeerIds = new Set(connectedPeerIds);
    const previousPeerIds = previousConnectedPeerIdsRef.current;

    // Check if peer list actually changed
    const peerListChanged = 
      currentPeerIds.size !== previousPeerIds.size ||
      [...currentPeerIds].some(id => !previousPeerIds.has(id)) ||
      [...previousPeerIds].some(id => !currentPeerIds.has(id));

    if (!peerListChanged) {
      return;
    }

    const existingCallPeerIds = new Set(cameraCallsRef.current.keys());
    const initiatedPeerIds = initiatedCallsRef.current;

    // Find peers that are connected but don't have camera calls yet and we haven't initiated
    const newPeers = connectedPeerIds.filter(
      (peerId) => !existingCallPeerIds.has(peerId) && !initiatedPeerIds.has(peerId)
    );

    if (newPeers.length === 0) {
      previousConnectedPeerIdsRef.current = currentPeerIds;
      return;
    }

    // Mark these peers as initiated to prevent duplicate calls
    newPeers.forEach(peerId => initiatedPeerIds.add(peerId));

    // Create camera calls to new peers
    newPeers.forEach(async (peerId) => {
      try {
        const call = peer.call(peerId, cameraStreamRef.current, {
          metadata: { type: "camerashare" },
        });

        if (!call) {
          console.warn("[camera] failed to create call to new peer", peerId);
          initiatedPeerIds.delete(peerId);
          return;
        }

        cameraCallsRef.current.set(peerId, call);

        // Handle incoming stream from peer
        call.on("stream", (remoteStream) => {
          console.log("[camera] received remote camera stream from new peer", peerId);
          setRemoteCameraStreams((prev) => {
            // Only update if the stream actually changed
            if (prev.get(peerId) === remoteStream) {
              return prev;
            }
            const next = new Map(prev);
            next.set(peerId, remoteStream);
            return next;
          });
        });

        // Handle call errors
        call.on("error", (err) => {
          console.error("[camera] call error for new peer", peerId, err);
          cameraCallsRef.current.delete(peerId);
          initiatedPeerIds.delete(peerId); // Allow retry on error
          setRemoteCameraStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        });

        // Handle call close
        call.on("close", () => {
          console.log("[camera] call closed for new peer", peerId);
          cameraCallsRef.current.delete(peerId);
          initiatedPeerIds.delete(peerId); // Allow re-initiation if peer reconnects
          setRemoteCameraStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerId);
            return next;
          });
        });
      } catch (err) {
        console.error("[camera] error creating call to new peer", peerId, err);
        initiatedPeerIds.delete(peerId); // Allow retry on error
      }
    });

    // Update the ref for next comparison
    previousConnectedPeerIdsRef.current = currentPeerIds;
  }, [peer, connectedPeerIds, isSharingCamera]);

  // Cleanup when peer disconnects
  useEffect(() => {
    if (!isSharingCamera) {
      previousPeerIdsRef.current = new Set();
      return;
    }

    const currentPeerIds = new Set(connectedPeerIds);
    const previousPeerIds = previousPeerIdsRef.current;

    // Only process if there's an actual change
    const hasChanged = 
      currentPeerIds.size !== previousPeerIds.size ||
      [...currentPeerIds].some(id => !previousPeerIds.has(id)) ||
      [...previousPeerIds].some(id => !currentPeerIds.has(id));

    if (!hasChanged) {
      return;
    }

    // Clean up calls for disconnected peers
    cameraCallsRef.current.forEach((call, peerId) => {
      if (!currentPeerIds.has(peerId)) {
        try {
          call.close();
        } catch (err) {
          console.warn("[camera] error closing call for disconnected peer", err);
        }
        cameraCallsRef.current.delete(peerId);
        initiatedCallsRef.current.delete(peerId);
      }
    });

    // Clean up camera streams for disconnected peers
    setRemoteCameraStreams((prev) => {
      const filtered = new Map();
      let hasChanges = false;

      prev.forEach((stream, peerId) => {
        if (currentPeerIds.has(peerId)) {
          filtered.set(peerId, stream);
        } else {
          hasChanges = true;
        }
      });

      // Only return new Map if there were actual changes
      return hasChanges ? filtered : prev;
    });

    // Update the ref for next comparison
    previousPeerIdsRef.current = currentPeerIds;
  }, [connectedPeerIds, isSharingCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCameraCalls();
      cleanupCameraStream();
    };
  }, [cleanupCameraCalls, cleanupCameraStream]);

  return {
    isSharingCamera,
    cameraError,
    localCameraStream: cameraStreamRef.current,
    remoteCameraStreams,
    startCameraShare,
    stopCameraShare,
  };
}
