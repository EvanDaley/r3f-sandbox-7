import usePeerConnection from "../hooks/usePeerConnection";
import React from "react";
import "./WelcomeModal.css";

export default function WelcomeModal() {
  const {
    playerName,
    isConnected,
    hostId,
    setHostId,
    setMyPlayerName,
    handleConnect,
    connections,
    isHost,
    handleSceneChange,
  } = usePeerConnection();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleConnect();
  };

  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal-container">
        {!isConnected ? (
          <form className="welcome-modal-form" onSubmit={handleSubmit}>
            <label className="welcome-modal-label">NAME</label>
            <input
              type="text"
              placeholder="Enter Your Name"
              value={playerName}
              onChange={(e) => setMyPlayerName(e.target.value)}
              className="welcome-modal-input"
            />

            <label className="welcome-modal-label" style={{ display: 'none' }}>ROOM CODE</label>
            <input
              style={{ display: 'none' }}
              type="text"
              placeholder="Enter 3-Letter Room Code"
              value={hostId}
              onChange={(e) => setHostId(e.target.value.toUpperCase())}
              className="welcome-modal-input"
              maxLength={3}
            />

            <button type="submit" className="welcome-modal-button">
              Join
            </button>
          </form>
        ) : (
          <>
            <h1 className="welcome-title">Welcome!</h1>
            <p className="welcome-subtitle">
              The host will begin the match shortly
            </p>

            <div className="welcome-lobby">
              <h3>Players in Lobby</h3>
              <ul className="welcome-player-list">
                {Object.entries(connections).map(([peerId, data]) => (
                  <li key={peerId}>
                    <span className="player-name">
                      {data.name || "Unknown"}
                    </span>
                    <span className="player-id">{peerId.slice(0, 28)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isHost && (
              <button
                onClick={() => handleSceneChange("proceduralGround")}
                className="welcome-modal-button welcome-modal-button-green"
              >
                Start Game
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
