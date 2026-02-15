import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SIGNAL_CHANNEL = "webrtc-screen-share-lab-v1";
const HEARTBEAT_MS = 2000;

const styles = {
  page: {
    minHeight: "100%",
    display: "flex",
    alignItems: "stretch",
    justifyContent: "center",
    padding: "1rem",
    boxSizing: "border-box",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  panel: {
    width: "min(1100px, 100%)",
    background: "rgba(14, 22, 48, 0.88)",
    color: "#f7f9ff",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.15)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
    padding: "1rem",
    display: "grid",
    gap: "1rem",
    gridTemplateRows: "auto auto 1fr",
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
  },
  button: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "#1f51ff",
    color: "white",
    borderRadius: "8px",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
  },
  mutedButton: {
    border: "1px solid rgba(255,255,255,0.25)",
    background: "#2f3552",
    color: "white",
    borderRadius: "8px",
    padding: "0.5rem 0.8rem",
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gap: "1rem",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  },
  card: {
    background: "rgba(255,255,255,0.06)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    padding: "0.75rem",
  },
  video: {
    width: "100%",
    borderRadius: "10px",
    background: "#000",
    minHeight: "220px",
    objectFit: "contain",
  },
  badge: {
    fontSize: "0.85rem",
    color: "#c8d1f7",
  },
};

const createId = () =>
  `${Math.random().toString(36).slice(2, 8)}-${Math.random().toString(36).slice(2, 8)}`;

export default function WebrtcScreenShareLab() {
  const selfId = useMemo(createId, []);
  const [status, setStatus] = useState("Initializing...");
  const [participants, setParticipants] = useState([]);
  const [remotePeerId, setRemotePeerId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef(null);
  const pcRef = useRef(null);
  const heartbeatRef = useRef(null);
  const presenceRef = useRef({});
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);

  const sortedParticipants = useMemo(
    () => participants.filter((id) => id !== selfId).sort(),
    [participants, selfId]
  );

  const publish = useCallback(
    (payload) => {
      channelRef.current?.postMessage({ ...payload, from: selfId });
    },
    [selfId]
  );

  const destroyPeerConnection = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
    }
    pcRef.current = null;
    setConnected(false);
  }, []);

  const attachRemoteStream = useCallback((stream) => {
    remoteStreamRef.current = stream;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
    }
  }, []);

  const ensurePeerConnection = useCallback(() => {
    if (!remotePeerId) {
      setStatus("Choose a remote peer first.");
      return null;
    }

    if (pcRef.current) {
      return pcRef.current;
    }

    const polite = selfId > remotePeerId;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const remoteStream = new MediaStream();
    attachRemoteStream(remoteStream);

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => remoteStream.addTrack(track));
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      publish({ type: "signal", to: remotePeerId, candidate: event.candidate });
    };

    pc.onconnectionstatechange = () => {
      setConnected(
        pc.connectionState === "connected" || pc.connectionState === "completed"
      );
      setStatus(`Connection: ${pc.connectionState}`);
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        publish({ type: "signal", to: remotePeerId, description: pc.localDescription });
      } catch (error) {
        setStatus(`Negotiation error: ${error.message}`);
      } finally {
        makingOfferRef.current = false;
      }
    };

    pcRef.current = pc;

    const existingStream = localStreamRef.current;
    if (existingStream) {
      existingStream.getTracks().forEach((track) => pc.addTrack(track, existingStream));
    }

    pc.__polite = polite;
    setStatus(`Peer connection created (${polite ? "polite" : "impolite"}).`);
    return pc;
  }, [attachRemoteStream, publish, remotePeerId, selfId]);

  const handleSignal = useCallback(
    async ({ from, description, candidate }) => {
      if (!remotePeerId || from !== remotePeerId) return;

      const pc = ensurePeerConnection();
      if (!pc) return;

      try {
        if (description) {
          const offerCollision =
            description.type === "offer" &&
            (makingOfferRef.current || pc.signalingState !== "stable");

          ignoreOfferRef.current = !pc.__polite && offerCollision;
          if (ignoreOfferRef.current) {
            setStatus("Ignored glare offer (impolite mode).");
            return;
          }

          await pc.setRemoteDescription(description);

          if (description.type === "offer") {
            await pc.setLocalDescription();
            publish({ type: "signal", to: remotePeerId, description: pc.localDescription });
          }
        } else if (candidate) {
          try {
            await pc.addIceCandidate(candidate);
          } catch (error) {
            if (!ignoreOfferRef.current) {
              throw error;
            }
          }
        }
      } catch (error) {
        setStatus(`Signal handling error: ${error.message}`);
      }
    },
    [ensurePeerConnection, publish, remotePeerId]
  );

  const startShare = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });

      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getVideoTracks()[0].onended = () => {
        setStatus("Screen share ended.");
        setIsSharing(false);
      };

      const pc = ensurePeerConnection();
      if (pc) {
        const senders = pc.getSenders();
        stream.getTracks().forEach((track) => {
          const sender = senders.find((item) => item.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track);
          } else {
            pc.addTrack(track, stream);
          }
        });
      }

      setIsSharing(true);
      setStatus("Sharing screen.");
    } catch (error) {
      setStatus(`Share failed: ${error.message}`);
    }
  }, [ensurePeerConnection]);

  const stopShare = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    const pc = pcRef.current;
    if (pc) {
      pc.getSenders().forEach((sender) => {
        if (sender.track?.kind === "video" || sender.track?.kind === "audio") {
          sender.replaceTrack(null);
        }
      });
    }

    setIsSharing(false);
    setStatus("Screen share stopped.");
  }, []);

  useEffect(() => {
    const channel = new BroadcastChannel(SIGNAL_CHANNEL);
    channelRef.current = channel;

    const markPresence = (peerId) => {
      if (!peerId) return;
      presenceRef.current[peerId] = Date.now();
      const active = Object.entries(presenceRef.current)
        .filter(([, ts]) => Date.now() - ts < HEARTBEAT_MS * 3)
        .map(([id]) => id);
      if (!active.includes(selfId)) active.push(selfId);
      setParticipants(active);

      setRemotePeerId((current) => {
        if (current && active.includes(current)) return current;
        return active.filter((id) => id !== selfId).sort()[0] || "";
      });
    };

    const onMessage = (event) => {
      const message = event.data;
      if (!message || message.from === selfId) return;

      markPresence(message.from);

      if (message.type === "hello") {
        publish({ type: "hello" });
      }

      if (message.type === "signal" && message.to === selfId) {
        handleSignal(message);
      }

      if (message.type === "bye") {
        delete presenceRef.current[message.from];
        markPresence(selfId);
      }
    };

    channel.addEventListener("message", onMessage);
    publish({ type: "hello" });
    markPresence(selfId);

    heartbeatRef.current = window.setInterval(() => {
      publish({ type: "hello" });
      markPresence(selfId);
    }, HEARTBEAT_MS);

    return () => {
      publish({ type: "bye" });
      window.clearInterval(heartbeatRef.current);
      channel.removeEventListener("message", onMessage);
      channel.close();
      channelRef.current = null;
      destroyPeerConnection();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [destroyPeerConnection, handleSignal, publish, selfId]);

  useEffect(() => {
    if (!remotePeerId) {
      destroyPeerConnection();
      return;
    }

    ensurePeerConnection();
  }, [destroyPeerConnection, ensurePeerConnection, remotePeerId]);

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <header>
          <h2 style={{ margin: "0 0 0.4rem" }}>WebRTC Screen Share Lab (HTML only)</h2>
          <div style={styles.badge}>
            Open two localhost tabs in this scene. Either side can share screen and receive the other side.
          </div>
        </header>

        <div style={styles.controls}>
          <span style={styles.badge}>Your tab id: {selfId}</span>
          <label style={styles.badge} htmlFor="peer-select">
            Remote peer:
          </label>
          <select
            id="peer-select"
            value={remotePeerId}
            onChange={(event) => {
              setRemotePeerId(event.target.value);
              destroyPeerConnection();
            }}
          >
            <option value="">-- waiting for other tab --</option>
            {sortedParticipants.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
          <button style={styles.button} onClick={startShare} disabled={!remotePeerId}>
            Start screen share
          </button>
          <button style={styles.mutedButton} onClick={stopShare} disabled={!isSharing}>
            Stop share
          </button>
          <button
            style={styles.mutedButton}
            onClick={() => {
              destroyPeerConnection();
              ensurePeerConnection();
            }}
            disabled={!remotePeerId}
          >
            Reconnect
          </button>
          <span style={styles.badge}>{status}</span>
          <span style={styles.badge}>{connected ? "Connected" : "Not connected"}</span>
        </div>

        <section style={styles.cardGrid}>
          <article style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Your shared screen</h3>
            <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
          </article>
          <article style={styles.card}>
            <h3 style={{ marginTop: 0 }}>Remote incoming screen</h3>
            <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
          </article>
        </section>
      </div>
    </div>
  );
}
