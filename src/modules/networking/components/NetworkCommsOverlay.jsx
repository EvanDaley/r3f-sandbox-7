import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { broadcastNetworkMessage, subscribeToNetworkMessages } from "../core/networkEvents";
import { useNetworkingStore } from "../stores/useNetworkingStore";

const CHAT_CHANNEL = "chat";
const CHAT_MESSAGE_TYPE = "text";

const MAX_MESSAGE_LENGTH = 500;

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
    width: 880,
    maxWidth: "calc(100vw - 24px)",
    height: "min(560px, calc(100vh - 120px))",
    zIndex: 55,
    background: "rgba(8, 10, 19, 0.94)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    color: "white",
    display: "grid",
    gridTemplateColumns: "2fr minmax(260px, 1fr)",
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
  videoGrid: {
    minHeight: 0,
    overflow: "auto",
    padding: 12,
    display: "grid",
    gap: 10,
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    alignContent: "start",
  },
  tile: {
    borderRadius: 12,
    background: "#07080e",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    minHeight: 140,
    position: "relative",
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
    gridTemplateRows: "auto auto 1fr auto",
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
  chatLog: {
    minHeight: 0,
    overflow: "auto",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    background: "rgba(4,4,8,0.45)",
  },
  chatComposer: {
    padding: 10,
    borderTop: "1px solid rgba(255,255,255,0.12)",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 8,
  },
};

function StreamTile({ label, subtitle, stream, muted }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div style={overlayStyles.tile}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: "16 / 9" }}
      />
      <div style={overlayStyles.tileMeta}>{label}{subtitle ? ` • ${subtitle}` : ""}</div>
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

export default function NetworkCommsOverlay() {
  const peer = useNetworkingStore((state) => state.peer);
  const peerId = useNetworkingStore((state) => state.peerId);
  const activeConnections = useNetworkingStore((state) => state.activeConnections);
  const displayName = useNetworkingStore((state) => state.displayName);
  const chatMessages = useNetworkingStore((state) => state.chatMessages);
  const remoteMediaStreams = useNetworkingStore((state) => state.remoteMediaStreams);
  const addChatMessage = useNetworkingStore((state) => state.addChatMessage);
  const addRemoteMediaStream = useNetworkingStore((state) => state.addRemoteMediaStream);
  const removeRemoteMediaStream = useNetworkingStore((state) => state.removeRemoteMediaStream);

  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState("");
  const [cameraStream, setCameraStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [outgoingStream, setOutgoingStream] = useState(null);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const activeCallsRef = useRef({});
  const chatScrollRef = useRef(null);

  const connectedPeerIds = useMemo(() => Object.keys(activeConnections), [activeConnections]);

  const updateOutgoingVideoTrack = useCallback((videoTrack) => {
    Object.values(activeCallsRef.current).forEach((call) => {
      const sender = call?.peerConnection
        ?.getSenders()
        ?.find((candidate) => candidate.track?.kind === "video");

      if (!sender || !videoTrack) return;
      sender.replaceTrack(videoTrack).catch((error) => {
        console.error("[network/comms] replaceTrack(video) failed", error);
      });
    });
  }, []);

  const updateOutgoingAudioTrack = useCallback((audioTrack) => {
    Object.values(activeCallsRef.current).forEach((call) => {
      const sender = call?.peerConnection
        ?.getSenders()
        ?.find((candidate) => candidate.track?.kind === "audio");

      if (!sender || !audioTrack) return;
      sender.replaceTrack(audioTrack).catch((error) => {
        console.error("[network/comms] replaceTrack(audio) failed", error);
      });
    });
  }, []);

  const connectMediaCalls = useCallback(
    (stream) => {
      if (!peer || !stream) return;

      connectedPeerIds.forEach((remotePeerId) => {
        if (!remotePeerId || remotePeerId === peerId || activeCallsRef.current[remotePeerId]) return;

        const call = peer.call(remotePeerId, stream);
        activeCallsRef.current[remotePeerId] = call;

        call.on("stream", (incomingStream) => addRemoteMediaStream(remotePeerId, incomingStream));

        const teardown = () => {
          delete activeCallsRef.current[remotePeerId];
          removeRemoteMediaStream(remotePeerId);
        };

        call.on("close", teardown);
        call.on("error", teardown);
      });
    },
    [addRemoteMediaStream, connectedPeerIds, peer, peerId, removeRemoteMediaStream]
  );

  const ensureCameraAndMic = useCallback(async () => {
    if (cameraStream) return cameraStream;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { max: 24 },
      },
    });

    setCameraStream(stream);
    return stream;
  }, [cameraStream]);

  const enableDevices = useCallback(async () => {
    try {
      const stream = await ensureCameraAndMic();
      setOutgoingStream(stream);
      connectMediaCalls(stream);
    } catch (error) {
      console.error("[network/comms] could not initialize camera/mic", error);
    }
  }, [connectMediaCalls, ensureCameraAndMic]);

  const toggleMic = useCallback(() => {
    if (!cameraStream) return;

    setIsMicEnabled((current) => {
      const next = !current;
      cameraStream.getAudioTracks().forEach((track) => {
        track.enabled = next;
      });
      return next;
    });
  }, [cameraStream]);

  const toggleCamera = useCallback(() => {
    if (!cameraStream) return;

    setIsCameraEnabled((current) => {
      const next = !current;
      cameraStream.getVideoTracks().forEach((track) => {
        track.enabled = next;
      });
      return next;
    });
  }, [cameraStream]);

  const stopScreenShare = useCallback(() => {
    if (!screenStream) return;

    screenStream.getTracks().forEach((track) => track.stop());
    setScreenStream(null);
    setIsScreenSharing(false);

    if (cameraStream) {
      setOutgoingStream(cameraStream);
      const cameraVideoTrack = cameraStream.getVideoTracks()[0];
      if (cameraVideoTrack) {
        updateOutgoingVideoTrack(cameraVideoTrack);
      }
    }
  }, [cameraStream, screenStream, updateOutgoingVideoTrack]);

  const startScreenShare = useCallback(async () => {
    if (!cameraStream) {
      await enableDevices();
    }

    try {
      const nextScreenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 24,
        },
        audio: true,
      });

      const [screenTrack] = nextScreenStream.getVideoTracks();
      if (!screenTrack) return;

      screenTrack.onended = () => {
        stopScreenShare();
      };

      setScreenStream(nextScreenStream);
      setIsScreenSharing(true);

      const baseAudioTrack = (cameraStream || outgoingStream)?.getAudioTracks()[0];
      const combinedStream = new MediaStream([
        screenTrack,
        ...(baseAudioTrack ? [baseAudioTrack] : []),
      ]);

      setOutgoingStream(combinedStream);
      connectMediaCalls(combinedStream);
      updateOutgoingVideoTrack(screenTrack);

      if (baseAudioTrack) {
        updateOutgoingAudioTrack(baseAudioTrack);
      }
    } catch (error) {
      console.error("[network/comms] screen share denied/unavailable", error);
    }
  }, [cameraStream, connectMediaCalls, enableDevices, outgoingStream, stopScreenShare, updateOutgoingAudioTrack, updateOutgoingVideoTrack]);

  useEffect(() => {
    if (!peer) return undefined;

    const onCall = (call) => {
      const streamToSend = outgoingStream || cameraStream;
      call.answer(streamToSend || undefined);
      activeCallsRef.current[call.peer] = call;

      call.on("stream", (incomingStream) => {
        addRemoteMediaStream(call.peer, incomingStream);
      });

      const teardown = () => {
        delete activeCallsRef.current[call.peer];
        removeRemoteMediaStream(call.peer);
      };

      call.on("close", teardown);
      call.on("error", teardown);
    };

    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [addRemoteMediaStream, cameraStream, outgoingStream, peer, removeRemoteMediaStream]);

  useEffect(() => {
    if (!outgoingStream) return;
    connectMediaCalls(outgoingStream);
  }, [connectMediaCalls, connectedPeerIds, outgoingStream]);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkMessages((message) => {
      if (message.channel !== CHAT_CHANNEL || message.type !== CHAT_MESSAGE_TYPE) return;

      addChatMessage({
        id: message.timestamp,
        senderPeerId: message.senderPeerId,
        senderName: message.payload?.senderName || message.senderPeerId,
        text: message.payload?.text || "",
      });
    });

    return unsubscribe;
  }, [addChatMessage]);

  useEffect(() => {
    if (!chatScrollRef.current) return;
    chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [chatMessages.length]);

  useEffect(() => {
    return () => {
      Object.values(activeCallsRef.current).forEach((call) => call?.close());
      cameraStream?.getTracks().forEach((track) => track.stop());
      screenStream?.getTracks().forEach((track) => track.stop());
    };
  }, [cameraStream, screenStream]);

  const sendMessage = useCallback(() => {
    const text = pendingMessage.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text) return;

    const localMessage = {
      id: Date.now(),
      senderPeerId: peerId,
      senderName: displayName || peerId || "You",
      text,
    };

    addChatMessage(localMessage);
    broadcastNetworkMessage({
      channel: CHAT_CHANNEL,
      type: CHAT_MESSAGE_TYPE,
      payload: {
        text,
        senderName: displayName || peerId || "You",
      },
    });
    setPendingMessage("");
  }, [addChatMessage, displayName, peerId, pendingMessage]);

  const localPreviewStream = screenStream || cameraStream || outgoingStream;

  return (
    <>
      <button type="button" style={overlayStyles.launcher} onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "Hide Meeting" : "Open Meeting"} ({connectedPeerIds.length + 1})
      </button>

      {isOpen && (
        <div style={overlayStyles.root}>
          <section style={overlayStyles.stage}>
            <div style={overlayStyles.videoGrid}>
              {localPreviewStream && (
                <StreamTile
                  stream={localPreviewStream}
                  muted
                  label="You"
                  subtitle={isScreenSharing ? "Presenting" : "Camera"}
                />
              )}

              {Object.entries(remoteMediaStreams).map(([remotePeerId, stream]) => (
                <StreamTile key={remotePeerId} stream={stream} muted={false} label={remotePeerId} subtitle="Remote" />
              ))}
            </div>

            <div style={overlayStyles.controlsBar}>
              <button type="button" style={controlButtonStyle({ active: !!cameraStream })} onClick={enableDevices}>
                {cameraStream ? "Devices Ready" : "Join with camera/mic"}
              </button>
              <button
                type="button"
                style={controlButtonStyle({ danger: !isMicEnabled })}
                onClick={toggleMic}
                disabled={!cameraStream}
              >
                {isMicEnabled ? "Mute" : "Unmute"}
              </button>
              <button
                type="button"
                style={controlButtonStyle({ danger: !isCameraEnabled })}
                onClick={toggleCamera}
                disabled={!cameraStream}
              >
                {isCameraEnabled ? "Stop camera" : "Start camera"}
              </button>
              {!isScreenSharing ? (
                <button
                  type="button"
                  style={controlButtonStyle({ active: false })}
                  onClick={startScreenShare}
                  disabled={!cameraStream}
                >
                  Present now
                </button>
              ) : (
                <button type="button" style={controlButtonStyle({ danger: true })} onClick={stopScreenShare}>
                  Stop presenting
                </button>
              )}
            </div>
          </section>

          <aside style={overlayStyles.rightPanel}>
            <h3 style={overlayStyles.sectionTitle}>Meeting chat</h3>
            <div style={overlayStyles.participants}>
              <div><strong>Participants</strong>: {connectedPeerIds.length + 1}</div>
              <div>You: {peerId || "connecting..."}</div>
              {connectedPeerIds.map((id) => (
                <div key={id}>• {id}</div>
              ))}
            </div>
            <div ref={chatScrollRef} style={overlayStyles.chatLog}>
              {chatMessages.length === 0 && <div style={{ opacity: 0.65, fontSize: 12 }}>No messages yet</div>}
              {chatMessages.map((message) => {
                const isSelf = message.senderPeerId === peerId;
                return (
                  <div
                    key={`${message.id}-${message.senderPeerId}`}
                    style={{
                      alignSelf: isSelf ? "flex-end" : "flex-start",
                      maxWidth: "90%",
                      border: "1px solid rgba(255,255,255,0.14)",
                      background: isSelf ? "rgba(56,102,255,0.35)" : "rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      padding: "6px 8px",
                    }}
                  >
                    <div style={{ fontSize: 10, opacity: 0.74, marginBottom: 2 }}>{isSelf ? "You" : (message.senderName || message.senderPeerId)}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.4, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message.text}</div>
                  </div>
                );
              })}
            </div>
            <div style={overlayStyles.chatComposer}>
              <input
                type="text"
                value={pendingMessage}
                onChange={(event) => setPendingMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Message everyone"
                style={{
                  minWidth: 0,
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                  padding: "9px 12px",
                }}
              />
              <button type="button" style={controlButtonStyle({ active: true })} onClick={sendMessage}>
                Send
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
