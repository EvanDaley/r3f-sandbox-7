import ChatPanel from "../chatV1/html/ChatPanel";

export default function MovementSandbox4Overlay() {
  return (
    <>
      <ChatPanel />
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.5)",
        padding: "10px",
        borderRadius: "6px",
      }}>
        <div><strong>Movement Sandbox 4</strong></div>
        <div style={{ fontSize: "12px", marginTop: "4px", opacity: 0.9 }}>
          Use <strong>WASD</strong> to move
        </div>
      </div>
    </>
  );
}

