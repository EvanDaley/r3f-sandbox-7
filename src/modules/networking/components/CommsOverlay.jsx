import { useCallback, useEffect, useRef, useState } from "react";
import { useNetworkingStore } from "../stores/useNetworkingStore";
import { useVoiceChat } from "../hooks/useVoiceChat";
import { useCameraShare } from "../hooks/useCameraShare";
import { useScreenShare } from "../hooks/useScreenShare";

// Custom scrollbar styles for thumbnail grid
const scrollbarStyles = `
  .video-grid-scrollbar::-webkit-scrollbar {
    height: 6px;
  }
  .video-grid-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  .video-grid-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }
  .video-grid-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

// Inject scrollbar styles once
if (typeof document !== 'undefined' && !document.getElementById('comms-scrollbar-styles')) {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'comms-scrollbar-styles';
  styleSheet.textContent = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

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
    zIndex: 55,
    background: "rgba(8, 10, 19, 0.94)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 16,
    color: "white",
    display: "grid",
    gridTemplateColumns: "1fr auto",
    overflow: "hidden",
    boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
    backdropFilter: "blur(12px)",
  },
  resizeHandle: {
    position: "absolute",
    top: 0,
    right: 0,
    width: "24px",
    height: "24px",
    cursor: "nwse-resize",
    zIndex: 100,
    background: "rgba(255,255,255,0.2)",
    borderBottomLeftRadius: 16,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    padding: "4px",
  },
  stage: {
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    borderRight: "1px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  videoArea: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 12,
    overflow: "hidden",
  },
  featuredTile: {
    flex: 1,
    minHeight: 0,
    borderRadius: 12,
    background: "#06070d",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.16)",
    position: "relative",
  },
  videoGrid: {
    height: 120,
    minHeight: 120,
    overflowX: "auto",
    overflowY: "hidden",
    display: "flex",
    gap: 10,
    padding: "4px 0",
    flexDirection: "row",
    // Custom scrollbar styling for Firefox
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,255,255,0.15) rgba(255,255,255,0.05)",
  },
  tile: {
    borderRadius: 8,
    background: "#07080e",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.12)",
    width: 160,
    minWidth: 160,
    height: 90,
    flexShrink: 0,
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
  const [videoAspectRatio, setVideoAspectRatio] = useState(16 / 9);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    if (stream) {
      // Only update srcObject if it's actually different to avoid unnecessary re-renders
      if (videoElement.srcObject !== stream) {
        videoElement.srcObject = stream;
      }
      videoElement.play().catch((err) => {
        console.warn("[comms] video play failed", { label, err });
      });

      // Update aspect ratio when video metadata loads
      const updateAspectRatio = () => {
        if (videoElement.videoWidth && videoElement.videoHeight) {
          const aspectRatio = videoElement.videoWidth / videoElement.videoHeight;
          setVideoAspectRatio(aspectRatio);
        }
      };

      videoElement.addEventListener("loadedmetadata", updateAspectRatio);
      
      // Try to get aspect ratio immediately if already loaded
      if (videoElement.videoWidth && videoElement.videoHeight) {
        updateAspectRatio();
      }

      return () => {
        videoElement.removeEventListener("loadedmetadata", updateAspectRatio);
        // Don't clear srcObject in cleanup - only clear if stream becomes null
      };
    } else {
      // Only clear if it's not already null
      if (videoElement.srcObject !== null) {
        videoElement.srcObject = null;
      }
    }
  }, [label, stream, subtitle]);

  // Check if this is a featured tile (has flex: 1 in style)
  const isFeaturedTile = style && (style.flex === 1 || style.flex === "1");
  
  return (
    <div
      style={{
        ...(isFeaturedTile ? {} : overlayStyles.tile), // Don't apply tile styles to featured tile
        ...(style || {}),
        border: isActive ? "1px solid rgba(101,149,255,0.9)" : (style?.border || (isFeaturedTile ? "1px solid rgba(255,255,255,0.16)" : overlayStyles.tile.border)),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        ...(isFeaturedTile ? { width: "100%", height: "100%" } : {}), // Featured tile should fill container
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
      <div
        style={{
          width: "100%",
          position: "relative",
          paddingTop: `${(1 / videoAspectRatio) * 100}%`,
          backgroundColor: "#000",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
        <div style={overlayStyles.tileMeta}>
          {label}
          {subtitle ? ` • ${subtitle}` : ""}
        </div>
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

  const [isOpen, setIsOpen] = useState(true); // Open by default
  const [featuredStream, setFeaturedStream] = useState(null);

  // Note that on the height we later SUBTRACT the height of the featured video area (400px)
  const [panelSize, setPanelSize] = useState({ width: 356, height: 225 }); // Small default size
  const [isParticipantsCollapsed, setIsParticipantsCollapsed] = useState(true); // Hidden by default
  const [isFeaturedVideoVisible, setIsFeaturedVideoVisible] = useState(false); // Hidden by default
  const [isThumbnailsVisible, setIsThumbnailsVisible] = useState(true); // Visible by default

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

  // Camera share hook
  const {
    isSharingCamera,
    cameraError,
    localCameraStream,
    remoteCameraStreams,
    startCameraShare,
    stopCameraShare,
  } = useCameraShare(peer, connectedPeerIds);

  // Screen share hook
  const {
    isSharingScreen,
    screenError,
    localScreenStream,
    remoteScreenStreams,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare(peer, connectedPeerIds);

  const remoteScreenEntries = Array.from(remoteScreenStreams.entries());

  // Available streams for the grid (screen shares and cameras) - always show all streams
  const gridStreams = [];

  if (localScreenStream) {
    gridStreams.push({ stream: localScreenStream, label: "You", subtitle: "Screen", type: "screen" });
  }

  remoteScreenEntries.forEach(([remotePeerId, stream]) => {
    gridStreams.push({
      stream,
      label: remotePeerId.slice(0, 8) || "Remote",
      subtitle: "Screen",
      type: "screen",
    });
  });

  if (localCameraStream) {
    gridStreams.push({ stream: localCameraStream, label: "You", subtitle: "Camera", type: "camera" });
  }

  remoteCameraStreams.forEach((stream, remotePeerId) => {
    gridStreams.push({ stream, label: remotePeerId.slice(0, 8) || "Remote", subtitle: "Camera", type: "camera" });
  });

  // Determine which stream to show in featured tile
  const isValidFeaturedStream = featuredStream && gridStreams.some((item) => item.stream === featuredStream);

  const preferredStream =
    remoteScreenEntries[0]?.[1] || localScreenStream || localCameraStream || Array.from(remoteCameraStreams.values())[0] || null;

  const featuredStreamToShow = isValidFeaturedStream ? featuredStream : preferredStream;

  // Clear featuredStream if it's no longer valid
  useEffect(() => {
    if (featuredStream && !isValidFeaturedStream) {
      setFeaturedStream(null);
    }
  }, [featuredStream, isValidFeaturedStream, gridStreams]);

  const featuredItem = gridStreams.find((item) => item.stream === featuredStreamToShow);
  const featuredLabel = featuredItem?.label || null;
  const featuredSubtitle = featuredItem?.type === "screen" ? "Screen Share" : featuredItem?.type === "camera" ? "Camera" : null;

  const canShare = connectedPeerIds.length > 0 && peer && !isSharingScreen;

  // Featured video height (approximate, accounts for padding and gaps)
  const FEATURED_VIDEO_HEIGHT = 400;

  // Track previous featured video visibility to only adjust on actual changes
  const prevFeaturedVideoVisibleRef = useRef(isFeaturedVideoVisible);

  // Adjust panel height when featured video visibility changes (but not on initial mount)
  useEffect(() => {
    // Skip adjustment on initial mount - respect the default height
    if (prevFeaturedVideoVisibleRef.current === isFeaturedVideoVisible) {
      return;
    }

    setPanelSize((prev) => {
      const heightDelta = isFeaturedVideoVisible ? FEATURED_VIDEO_HEIGHT : -FEATURED_VIDEO_HEIGHT;
      const newHeight = Math.max(150, Math.min(window.innerHeight - 88, prev.height + heightDelta));
      return { ...prev, height: newHeight };
    });

    prevFeaturedVideoVisibleRef.current = isFeaturedVideoVisible;
  }, [isFeaturedVideoVisible]);

  // Resize handler
  const resizeRef = useRef(null);
  const isResizingRef = useRef(false);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isResizingRef.current = true;
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelSize.width;
    const startHeight = panelSize.height;

    const handleMouseMove = (e) => {
      if (!isResizingRef.current) return;
      const newWidth = Math.max(300, Math.min(window.innerWidth - 24, startWidth + (e.clientX - startX)));
      // Invert Y calculation since panel is bottom-anchored - dragging down should increase height
      const newHeight = Math.max(150, Math.min(window.innerHeight - 88, startHeight - (e.clientY - startY)));
      setPanelSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [panelSize]);

  return (
    <>
      <button type="button" style={overlayStyles.launcher} onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "Hide Comms" : "Open Comms"} ({connectedPeerIds.length + 1})
      </button>

      {isOpen && (
        <div 
          style={{
            ...overlayStyles.root,
            width: `${panelSize.width}px`,
            height: `${panelSize.height}px`,
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100vh - 88px)",
            gridTemplateColumns: isParticipantsCollapsed ? "1fr" : "1fr auto",
          }}
        >
          <div
            ref={resizeRef}
            style={overlayStyles.resizeHandle}
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          >
            <div style={{
              width: "12px",
              height: "12px",
              borderRight: "2px solid rgba(255,255,255,0.7)",
              borderBottom: "2px solid rgba(255,255,255,0.7)",
            }} />
          </div>
          <section style={overlayStyles.stage}>
            <div style={overlayStyles.videoArea}>
              {isFeaturedVideoVisible && (
                <div style={overlayStyles.featuredTile}>
                  {featuredStreamToShow ? (
                    <VideoTile
                      stream={featuredStreamToShow}
                      muted={featuredStreamToShow === localScreenStream || featuredStreamToShow === localCameraStream}
                      label={featuredLabel}
                      subtitle={featuredSubtitle}
                      onClick={() => {
                        // Cycle to next stream or clear if no other streams
                        if (gridStreams.length > 1) {
                          const currentIndex = gridStreams.findIndex(item => item.stream === featuredStreamToShow);
                          const nextIndex = (currentIndex + 1) % gridStreams.length;
                          setFeaturedStream(gridStreams[nextIndex].stream);
                        } else {
                          setFeaturedStream(null);
                        }
                      }}
                      isActive
                      style={overlayStyles.featuredTile}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "grid", placeItems: "center", opacity: 0.65, fontSize: 13 }}>
                      Click "Start Sharing" or "Start Camera" to share
                    </div>
                  )}
                </div>
              )}

              {isThumbnailsVisible && (
                <div 
                  style={{
                    ...overlayStyles.videoGrid,
                    ...(isFeaturedVideoVisible ? {} : { height: "auto", flex: 1, minHeight: 0 }),
                  }}
                  className="video-grid-scrollbar"
                >
                  {gridStreams.length === 0 ? (
                    <div style={{ opacity: 0.65, fontSize: 12, padding: "6px 4px", alignSelf: "center", width: "100%", textAlign: "center" }}>
                      Remote feeds will appear here when another participant shares their screen or camera.
                    </div>
                  ) : (
                    gridStreams.map((item, idx) => (
                      <VideoTile
                        key={`${item.type}-${item.label}-${idx}`}
                        stream={item.stream}
                        muted={item.stream === localScreenStream || item.stream === localCameraStream}
                        label={item.label}
                        subtitle={item.subtitle}
                        onClick={() => {
                          // If clicking the already-featured stream, collapse featured video
                          if (featuredStreamToShow === item.stream && isFeaturedVideoVisible) {
                            setIsFeaturedVideoVisible(false);
                          } else {
                            // Set as featured stream (thumbnails stay in grid)
                            setFeaturedStream(item.stream);
                            // If featured video is hidden, show it when clicking a thumbnail
                            if (!isFeaturedVideoVisible) {
                              setIsFeaturedVideoVisible(true);
                            }
                          }
                        }}
                        isActive={featuredStreamToShow === item.stream}
                      />
                    ))
                  )}
                </div>
              )}
            </div>

            <div style={overlayStyles.controlsBar}>
              {(screenError || voiceError || cameraError) && (
                <div style={{ width: "100%", color: "#ffb4b4", fontSize: 12, lineHeight: 1.35 }}>
                  {screenError || voiceError || cameraError}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", width: "100%" }}>
                {!isSharingScreen ? (
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
                {!isSharingCamera ? (
                  <button
                    type="button"
                    style={controlButtonStyle({ active: false, disabled: connectedPeerIds.length === 0 })}
                    onClick={startCameraShare}
                    disabled={connectedPeerIds.length === 0 || !peer}
                  >
                    Start Camera
                  </button>
                ) : (
                  <button type="button" style={controlButtonStyle({ danger: true })} onClick={stopCameraShare}>
                    Stop Camera
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
                <button
                  type="button"
                  style={controlButtonStyle({ active: isFeaturedVideoVisible })}
                  onClick={() => setIsFeaturedVideoVisible(!isFeaturedVideoVisible)}
                  title={isFeaturedVideoVisible ? "Hide featured video" : "Show featured video"}
                >
                  {isFeaturedVideoVisible ? "Hide Featured Video" : "Featured Video"}
                </button>
                <button
                  type="button"
                  style={controlButtonStyle({ active: !isParticipantsCollapsed })}
                  onClick={() => setIsParticipantsCollapsed(!isParticipantsCollapsed)}
                  title={isParticipantsCollapsed ? "Show details" : "Hide details"}
                >
                  {isParticipantsCollapsed ? "Show Details" : "Hide Details"}
                </button>
                <button
                  type="button"
                  style={controlButtonStyle({ active: !isThumbnailsVisible })}
                  onClick={() => setIsThumbnailsVisible(!isThumbnailsVisible)}
                  title={isThumbnailsVisible ? "Hide thumbnails" : "Show thumbnails"}
                >
                  {isThumbnailsVisible ? "Hide Thumbnails" : "Show Thumbnails"}
                </button>
              </div>
            </div>
          </section>

          {!isParticipantsCollapsed && (
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
                  {remoteCameraStreams.has(id) && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>📹</span>
                  )}
                  {remoteScreenStreams.has(id) && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.9 }}>🖥️</span>
                  )}
                </div>
              ))}
              <div style={{ marginTop: 6, fontSize: 11, opacity: 0.8 }}>
                {isSharingScreen ? "Sharing your screen" : "Not sharing screen"}
                {remoteScreenStreams.size > 0 && ` • ${remoteScreenStreams.size} remote share${remoteScreenStreams.size > 1 ? "s" : ""}`}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, opacity: 0.8 }}>
                {isSharingCamera ? "Sharing your camera" : "Not sharing camera"}
                {remoteCameraStreams.size > 0 && ` • ${remoteCameraStreams.size} remote camera${remoteCameraStreams.size > 1 ? "s" : ""}`}
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
          )}
        </div>
      )}
    </>
  );
}
