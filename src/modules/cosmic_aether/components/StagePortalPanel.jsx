import useCosmicAetherStore from "../stores/cosmicAetherStore";

export default function StagePortalPanel() {
  const currentStageId = useCosmicAetherStore((state) => state.currentStageId);
  const setStage = useCosmicAetherStore((state) => state.setStage);
  const canAccessStage = useCosmicAetherStore((state) => state.canAccessStage);
  const stages = useCosmicAetherStore((state) => state.getStageList());

  return (
    <div style={panelStyle}>
      <h3 style={titleStyle}>Cosmic Routes</h3>
      {stages.map((stage) => {
        const locked = !canAccessStage(stage.id);
        return (
          <button
            key={stage.id}
            disabled={locked || stage.id === currentStageId}
            onClick={() => setStage(stage.id)}
            style={{ ...buttonStyle, opacity: locked ? 0.45 : 1 }}
            title={locked ? `Locked by ${stage.requiredUnlock}` : stage.description}
          >
            {stage.name}
          </button>
        );
      })}
    </div>
  );
}

const panelStyle = {
  position: "absolute",
  top: 80,
  left: 24,
  width: 220,
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(126,126,160,0.35)",
  borderRadius: 12,
  padding: 12,
  backdropFilter: "blur(5px)",
  pointerEvents: "auto",
};

const titleStyle = { margin: "0 0 8px", color: "#313649", fontSize: 14, fontWeight: 700 };

const buttonStyle = {
  display: "block",
  width: "100%",
  textAlign: "left",
  marginBottom: 6,
  background: "rgba(244,246,255,0.9)",
  border: "1px solid rgba(78,86,128,0.25)",
  borderRadius: 8,
  padding: "8px 10px",
  color: "#2f344d",
  cursor: "pointer",
  fontWeight: 600,
};
