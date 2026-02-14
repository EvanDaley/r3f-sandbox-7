import React from "react";

export default function GravitySandboxOverlay() {
  return (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "10px",
      color: "white",
      fontFamily: "Arial, sans-serif",
      fontSize: "14px",
      zIndex: 1000,
    }}>
      <div>Use <strong>WASD</strong> to move</div>
      <div><strong>SPACE</strong> to jump</div>
      <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
        Watch out - you'll fall if you step off the tiles!
      </div>
    </div>
  );
}

