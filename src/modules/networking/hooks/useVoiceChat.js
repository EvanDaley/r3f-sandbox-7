import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useVoiceChat - Production-ready hook for managing voice chat via WebRTC
 * 
 * Features:
 * - Audio-only stream management
 * - Separate call handling from screen share
 * - Mute/unmute functionality
 * - Proper cleanup and error handling
 * - Handles multiple peer connections
 */
export function useVoiceChat(peer, connectedPeerIds) {
  const [isInVoiceChat, setIsInVoiceChat] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [remoteAudioStreams, setRemoteAudioStreams] = useState(new Map());

  const audioStreamRef = useRef(null);
  const voiceCallsRef = useRef(new Map());
  const audioElementsRef = useRef(new Map());

  // Cleanup audio stream
  const cleanupAudioStream = useCallback(() => {
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        track.onended = null;
      });
      audioStreamRef.current = null;
    }
    setIsInVoiceChat(false);
  }, []);

  // Cleanup voice calls
  const cleanupVoiceCalls = useCallback(() => {
    voiceCallsRef.current.forEach((call) => {
      try {
        call.close();
      } catch (err) {
        console.warn("[voice] error closing voice call", err);
      }
    });
    voiceCallsRef.current.clear();
  }, []);

  // Cleanup audio elements
  const cleanupAudioElements = useCallback(() => {
    audioElementsRef.current.forEach((audioElement) => {
      if (audioElement) {
        audioElement.srcObject = null;
        audioElement.pause();
      }
    });
    audioElementsRef.current.clear();
  }, []);

  // Start voice chat
  const startVoiceChat = useCallback(async () => {
    if (!peer || connectedPeerIds.length === 0) {
      setVoiceError("Not connected to any peers. Please wait for connection.");
      return;
    }

    try {
      setVoiceError("");

      // Request microphone access with audio constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: { ideal: 48000 },
          channelCount: { ideal: 1 },
        },
        video: false,
      });

      // Check if we got an audio track
      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        stream.getTracks().forEach((track) => track.stop());
        setVoiceError("No audio track available from microphone.");
        return;
      }

      // Handle track ending (user revokes permission or device disconnects)
      audioTrack.onended = () => {
        console.log("[voice] audio track ended");
        stopVoiceChat();
      };

      audioStreamRef.current = stream;
      setIsInVoiceChat(true);
      setIsMuted(false);

      // Create voice calls to all connected peers
      const callPromises = connectedPeerIds.map(async (peerId) => {
        try {
          const call = peer.call(peerId, stream, {
            metadata: { type: "voicechat" },
          });

          if (!call) {
            throw new Error(`Failed to create voice call to ${peerId}`);
          }

          voiceCallsRef.current.set(peerId, call);
          initiatedCallsRef.current.add(peerId);

          // Handle incoming stream from peer (bidirectional)
          call.on("stream", (remoteStream) => {
            console.log("[voice] received remote audio stream from", peerId);
            setRemoteAudioStreams((prev) => {
              // Only update if the stream actually changed
              if (prev.get(peerId) === remoteStream) {
                return prev;
              }
              const next = new Map(prev);
              next.set(peerId, remoteStream);
              return next;
            });

            // Create audio element for remote stream
            const audioElement = new Audio();
            audioElement.srcObject = remoteStream;
            audioElement.autoplay = true;
            audioElement.volume = 1.0;
            
            audioElement.play().catch((err) => {
              console.warn("[voice] failed to play remote audio", err);
            });

            audioElementsRef.current.set(peerId, audioElement);
          });

          // Handle call errors
          call.on("error", (err) => {
            console.error("[voice] call error for", peerId, err);
            setVoiceError(`Voice connection error with ${peerId}: ${err.message || "Unknown error"}`);
            voiceCallsRef.current.delete(peerId);
            setRemoteAudioStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          });

          // Handle call close
          call.on("close", () => {
            console.log("[voice] call closed for", peerId);
            voiceCallsRef.current.delete(peerId);
            setRemoteAudioStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
            const audioElement = audioElementsRef.current.get(peerId);
            if (audioElement) {
              audioElement.srcObject = null;
              audioElementsRef.current.delete(peerId);
            }
          });
        } catch (err) {
          console.error("[voice] error creating call to", peerId, err);
        }
      });

      await Promise.allSettled(callPromises);
    } catch (err) {
      console.error("[voice] start voice chat error", err);

      let errorMessage = "Failed to start voice chat.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMessage = "Microphone permission was denied. Please allow access.";
      } else if (err.name === "NotFoundError" || err.name === "NotReadableError") {
        errorMessage = "Microphone is not available. Check your audio settings.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setVoiceError(errorMessage);
      cleanupAudioStream();
    }
  }, [peer, connectedPeerIds, cleanupAudioStream]);

  // Stop voice chat
  const stopVoiceChat = useCallback(() => {
    cleanupVoiceCalls();
    cleanupAudioStream();
    cleanupAudioElements();
    setRemoteAudioStreams(new Map());
    initiatedCallsRef.current.clear();
    previousPeerIdsRef.current.clear();
  }, [cleanupVoiceCalls, cleanupAudioStream, cleanupAudioElements]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!audioStreamRef.current) return;

    const audioTracks = audioStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      track.enabled = !track.enabled;
    });

    setIsMuted((prev) => !prev);
  }, []);

  // Handle incoming voice calls
  useEffect(() => {
    if (!peer) return;

    const handleCall = (call) => {
      const callType = call.metadata?.type;

      // Only handle voicechat calls
      if (callType !== "voicechat") {
        return;
      }

      console.log("[voice] incoming voice call from", call.peer);

      // Answer the call with our audio stream if we're in voice chat, otherwise answer with null
      call.answer(audioStreamRef.current || null);

      // Store the call
      voiceCallsRef.current.set(call.peer, call);

        // Handle incoming stream
        call.on("stream", (remoteStream) => {
          console.log("[voice] received remote audio stream from incoming call", call.peer);
          setRemoteAudioStreams((prev) => {
            // Only update if the stream actually changed
            if (prev.get(call.peer) === remoteStream) {
              return prev;
            }
            const next = new Map(prev);
            next.set(call.peer, remoteStream);
            return next;
          });

        // Create audio element for remote stream
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.autoplay = true;
        audioElement.volume = 1.0;

        audioElement.play().catch((err) => {
          console.warn("[voice] failed to play remote audio from incoming call", err);
        });

        audioElementsRef.current.set(call.peer, audioElement);
      });

      // Handle call errors
      call.on("error", (err) => {
        console.error("[voice] incoming call error", err);
        voiceCallsRef.current.delete(call.peer);
        setRemoteAudioStreams((prev) => {
          const next = new Map(prev);
          next.delete(call.peer);
          return next;
        });
      });

      // Handle call close
      call.on("close", () => {
        console.log("[voice] incoming call closed");
        voiceCallsRef.current.delete(call.peer);
        setRemoteAudioStreams((prev) => {
          const next = new Map(prev);
          next.delete(call.peer);
          return next;
        });
        const audioElement = audioElementsRef.current.get(call.peer);
        if (audioElement) {
          audioElement.srcObject = null;
          audioElementsRef.current.delete(call.peer);
        }
      });
    };

    peer.on("call", handleCall);

    return () => {
      peer.off("call", handleCall);
    };
  }, [peer]);

  // Track which peers we've already initiated calls to
  const initiatedCallsRef = useRef(new Set());
  const previousConnectedPeerIdsRef = useRef(new Set());

  // Automatically create voice calls to newly connected peers when already in voice chat
  useEffect(() => {
    if (!peer || !isInVoiceChat || !audioStreamRef.current) {
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

    const existingCallPeerIds = new Set(voiceCallsRef.current.keys());
    const initiatedPeerIds = initiatedCallsRef.current;

    // Find peers that are connected but don't have voice calls yet and we haven't initiated
    const newPeers = connectedPeerIds.filter(
      (peerId) => !existingCallPeerIds.has(peerId) && !initiatedPeerIds.has(peerId)
    );

    if (newPeers.length === 0) {
      previousConnectedPeerIdsRef.current = currentPeerIds;
      return;
    }

    // Mark these peers as initiated to prevent duplicate calls
    newPeers.forEach(peerId => initiatedPeerIds.add(peerId));

    // Create voice calls to new peers
    newPeers.forEach(async (peerId) => {
      try {
        const call = peer.call(peerId, audioStreamRef.current, {
          metadata: { type: "voicechat" },
        });

        if (!call) {
          console.warn("[voice] failed to create call to new peer", peerId);
          return;
        }

        voiceCallsRef.current.set(peerId, call);

        // Handle incoming stream from peer
        call.on("stream", (remoteStream) => {
          console.log("[voice] received remote audio stream from new peer", peerId);
          setRemoteAudioStreams((prev) => {
            // Only update if the stream actually changed
            if (prev.get(peerId) === remoteStream) {
              return prev;
            }
            const next = new Map(prev);
            next.set(peerId, remoteStream);
            return next;
          });

          // Create audio element for remote stream
          const audioElement = new Audio();
          audioElement.srcObject = remoteStream;
          audioElement.autoplay = true;
          audioElement.volume = 1.0;

          audioElement.play().catch((err) => {
            console.warn("[voice] failed to play remote audio from new peer", err);
          });

          audioElementsRef.current.set(peerId, audioElement);
        });

          // Handle call errors
          call.on("error", (err) => {
            console.error("[voice] call error for new peer", peerId, err);
            voiceCallsRef.current.delete(peerId);
            initiatedPeerIds.delete(peerId); // Allow retry on error
            setRemoteAudioStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          });

          // Handle call close
          call.on("close", () => {
            console.log("[voice] call closed for new peer", peerId);
            voiceCallsRef.current.delete(peerId);
            initiatedPeerIds.delete(peerId); // Allow re-initiation if peer reconnects
            setRemoteAudioStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
            const audioElement = audioElementsRef.current.get(peerId);
            if (audioElement) {
              audioElement.srcObject = null;
              audioElementsRef.current.delete(peerId);
            }
          });
      } catch (err) {
        console.error("[voice] error creating call to new peer", peerId, err);
        initiatedPeerIds.delete(peerId); // Allow retry on error
      }
    });

    // Update the ref for next comparison
    previousConnectedPeerIdsRef.current = currentPeerIds;
  }, [peer, connectedPeerIds, isInVoiceChat]);

  // Track previous peer IDs to avoid unnecessary updates
  const previousPeerIdsRef = useRef(new Set());

  // Cleanup when peer disconnects
  useEffect(() => {
    if (!isInVoiceChat) {
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
    voiceCallsRef.current.forEach((call, peerId) => {
      if (!currentPeerIds.has(peerId)) {
        try {
          call.close();
        } catch (err) {
          console.warn("[voice] error closing call for disconnected peer", err);
        }
        voiceCallsRef.current.delete(peerId);
      }
    });

    // Clean up audio streams for disconnected peers
    setRemoteAudioStreams((prev) => {
      const filtered = new Map();
      let hasChanges = false;

      prev.forEach((stream, peerId) => {
        if (currentPeerIds.has(peerId)) {
          filtered.set(peerId, stream);
        } else {
          hasChanges = true;
          // Clean up audio element for disconnected peer
          const audioElement = audioElementsRef.current.get(peerId);
          if (audioElement) {
            audioElement.srcObject = null;
            audioElementsRef.current.delete(peerId);
          }
        }
      });

      // Only return new Map if there were actual changes
      return hasChanges ? filtered : prev;
    });

    // Update the ref for next comparison
    previousPeerIdsRef.current = currentPeerIds;
  }, [connectedPeerIds, isInVoiceChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupVoiceCalls();
      cleanupAudioStream();
      cleanupAudioElements();
    };
  }, [cleanupVoiceCalls, cleanupAudioStream, cleanupAudioElements]);

  return {
    isInVoiceChat,
    isMuted,
    voiceError,
    remoteAudioStreams,
    startVoiceChat,
    stopVoiceChat,
    toggleMute,
  };
}
