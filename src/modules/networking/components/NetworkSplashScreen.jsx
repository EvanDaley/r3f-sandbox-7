import { useState } from "react";

export default function NetworkSplashScreen({ onSubmitName }) {
  const [name, setName] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    console.log("[network/splash] submitted display name", trimmed);
    onSubmitName(trimmed);
  };

  return (
    <div style={overlayStyle}>
      <form style={panelStyle} onSubmit={handleSubmit}>
        <h1 style={{ margin: 0 }}>Join Session</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Enter your name to initialize networking.</p>
        <input
          style={inputStyle}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
        />
        <button style={buttonStyle} type="submit">
          Continue
        </button>
      </form>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(5, 7, 14, 0.92)",
  zIndex: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const panelStyle = {
  width: "100%",
  maxWidth: 420,
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 12,
  padding: 20,
  display: "grid",
  gap: 12,
  background: "rgba(18, 24, 44, 0.96)",
};

const inputStyle = {
  width: "100%",
  minHeight: 40,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  padding: "0 12px",
  boxSizing: "border-box",
};

const buttonStyle = {
  minHeight: 40,
  borderRadius: 8,
  border: "none",
  cursor: "pointer",
  background: "#3d8bff",
  color: "white",
  fontWeight: 600,
};
