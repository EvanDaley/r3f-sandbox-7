import { useEffect, useMemo, useRef, useState } from "react";

const SIGNAL_CHANNEL = "webrtc-html-lab-signaling-v1";

const createEmptyMediaStream = () => new MediaStream();

export default function WebRtcHtmlLab() {
  const [roomId, setRoomId] = useState("localhost-room");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Pick host/client in each tab to begin.");
  const [isConnected, setIsConnected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [remoteSharing, setRemoteSharing] = useState(false);

  const channelRef = useRef(null);
  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(createEmptyMediaStream());
  const remoteStreamRef = useRef(createEmptyMediaStream());
  const screenTrackRef = useRef(null);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);
  const pendingCandidatesRef = useRef([]);
  const remotePresenceRef = useRef(false);

  const isPolite = useMemo(() => role === "client", [role]);

  const postSignal = (payload) => {
    if (!channelRef.current || !role) {
      return;
    }

    channelRef.current.postMessage({
      roomId,
      from: role,
      ...payload,
    });
  };

  const closeConnection = () => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.onnegotiationneeded = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    remoteStreamRef.current = createEmptyMediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }

    setIsConnected(false);
    setRemoteSharing(false);
  };

  const stopSharing = () => {
    const track = screenTrackRef.current;
    if (!track) {
      return;
    }

    track.onended = null;
    track.stop();
    screenTrackRef.current = null;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((streamTrack) => {
        localStreamRef.current.removeTrack(streamTrack);
      });
    }

    const sender = pcRef.current
      ?.getSenders()
      .find((pcSender) => pcSender.track?.kind === "video");

    if (sender) {
      sender.replaceTrack(null);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = createEmptyMediaStream();
    }

    setIsSharing(false);
  };

  const ensureConnection = () => {
    if (!role || pcRef.current) {
      return pcRef.current;
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        postSignal({ type: "ice", candidate: event.candidate });
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOfferRef.current = true;
        await pc.setLocalDescription();
        postSignal({ type: "sdp", description: pc.localDescription });
      } catch {
        setStatus("Negotiation failed. Try reconnecting both tabs.");
      } finally {
        makingOfferRef.current = false;
      }
    };

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      if (!stream) {
        return;
      }

      remoteStreamRef.current = stream;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }

      setRemoteSharing(stream.getVideoTracks().length > 0);

      stream.onremovetrack = () => {
        setRemoteSharing(stream.getVideoTracks().length > 0);
      };
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      setIsConnected(state === "connected");
      if (state === "connected") {
        setStatus("Connected. Start sharing from either tab.");
      }
      if (["failed", "disconnected", "closed"].includes(state)) {
        setStatus("Connection lost. Click reset and reconnect both tabs.");
      }
    };

    pcRef.current = pc;

    if (screenTrackRef.current) {
      pc.addTrack(screenTrackRef.current, localStreamRef.current);
    }

    return pc;
  };

  const startSharing = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const track = stream.getVideoTracks()[0];
      if (!track) {
        throw new Error("No video track from screen share.");
      }

      localStreamRef.current = stream;
      screenTrackRef.current = track;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = ensureConnection();
      const sender = pc
        .getSenders()
        .find((pcSender) => pcSender.track?.kind === "video");

      if (sender) {
        await sender.replaceTrack(track);
      } else {
        pc.addTrack(track, stream);
      }

      track.onended = () => {
        stopSharing();
      };

      setIsSharing(true);
      setStatus("Sharing started.");
    } catch {
      setStatus("Screen share canceled or blocked.");
    }
  };

  const handleSignal = async (message) => {
    if (!role || message.roomId !== roomId || message.from === role) {
      return;
    }

    if (message.type === "presence") {
      remotePresenceRef.current = true;
      setStatus(`Saw ${message.from}. Ready to connect.`);
      if (role === "host") {
        ensureConnection();
      }
      return;
    }

    const pc = ensureConnection();

    if (message.type === "sdp") {
      const offerCollision =
        message.description.type === "offer" &&
        (makingOfferRef.current || pc.signalingState !== "stable");

      ignoreOfferRef.current = !isPolite && offerCollision;
      if (ignoreOfferRef.current) {
        return;
      }

      try {
        await pc.setRemoteDescription(message.description);

        for (const candidate of pendingCandidatesRef.current) {
          await pc.addIceCandidate(candidate);
        }
        pendingCandidatesRef.current = [];

        if (message.description.type === "offer") {
          await pc.setLocalDescription();
          postSignal({ type: "sdp", description: pc.localDescription });
        }
      } catch {
        setStatus("Failed to process remote description.");
      }
      return;
    }

    if (message.type === "ice" && message.candidate) {
      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(message.candidate);
        } else {
          pendingCandidatesRef.current.push(message.candidate);
        }
      } catch {
        if (!ignoreOfferRef.current) {
          setStatus("Failed to add ICE candidate.");
        }
      }
    }
  };

  useEffect(() => {
    const channel = new BroadcastChannel(SIGNAL_CHANNEL);
    channel.onmessage = (event) => {
      handleSignal(event.data);
    };
    channelRef.current = channel;

    return () => {
      channel.close();
      channelRef.current = null;
      stopSharing();
      closeConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, roomId, isPolite]);

  useEffect(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  useEffect(() => {
    if (!role) {
      return;
    }

    postSignal({ type: "presence" });
  }, [role, roomId]);

  const resetAll = () => {
    stopSharing();
    closeConnection();
    pendingCandidatesRef.current = [];
    makingOfferRef.current = false;
    ignoreOfferRef.current = false;
    remotePresenceRef.current = false;
    setStatus("Reset complete. Re-select role if needed.");
    if (role) {
      postSignal({ type: "presence" });
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#101319", color: "#f3f5f7", padding: 20, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginTop: 0 }}>WebRTC HTML Screen Share Lab</h1>
      <p style={{ maxWidth: 800 }}>
        Open two localhost tabs. Set one to <strong>host</strong>, one to <strong>client</strong>, then click
        <strong> connect </strong> in either tab. You can start screen share from either side.
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <label>
          Room:&nbsp;
          <input
            value={roomId}
            onChange={(event) => setRoomId(event.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #455" }}
          />
        </label>
        <button type="button" onClick={() => setRole("host")}>Use host role</button>
        <button type="button" onClick={() => setRole("client")}>Use client role</button>
        <button
          type="button"
          onClick={() => {
            ensureConnection();
            postSignal({ type: "presence" });
            setStatus("Trying to connect...");
          }}
          disabled={!role}
        >
          Connect
        </button>
        <button type="button" onClick={startSharing} disabled={!role || isSharing}>
          Start screen share
        </button>
        <button type="button" onClick={stopSharing} disabled={!isSharing}>
          Stop share
        </button>
        <button type="button" onClick={resetAll}>Reset</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <strong>Role:</strong> {role || "not selected"} &nbsp;|&nbsp; <strong>Peer connected:</strong>{" "}
        {isConnected ? "yes" : "no"} &nbsp;|&nbsp; <strong>Local sharing:</strong> {isSharing ? "yes" : "no"}
        &nbsp;|&nbsp; <strong>Remote sharing:</strong> {remoteSharing ? "yes" : "no"}
      </div>

      <div style={{ marginBottom: 16, padding: 10, background: "#1b2230", borderRadius: 8 }}>
        <strong>Status:</strong> {status}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <h3>Local preview</h3>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", background: "black", minHeight: 240, borderRadius: 8 }}
          />
        </div>
        <div>
          <h3>Remote video</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: "100%", background: "black", minHeight: 240, borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  );
}
