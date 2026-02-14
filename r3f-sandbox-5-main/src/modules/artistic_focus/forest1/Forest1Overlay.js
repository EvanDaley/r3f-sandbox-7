import React from "react";
import TerrainControls from "./components/TerrainControls";

export default function Forest1Overlay() {
  return (
    <>
      <div style={{
        position: "absolute",
        top: "10px",
        left: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        zIndex: 1000,
      }}>
        <div>Press <strong>E</strong> near a box to grab it</div>
        <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.8 }}>
          Two players must grab the same box to carry it together
        </div>
      </div>
      
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
      }}>
        <TerrainControls />
      </div>
    </>
  );
}

