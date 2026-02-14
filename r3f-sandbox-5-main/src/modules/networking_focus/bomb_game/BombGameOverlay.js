import React from "react";

export default function BombGameOverlay() {
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
      <div>Press <strong>E</strong> to pick up/drop bombs</div>
      <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
        Two players needed to carry a bomb
      </div>
    </div>
  );
}

