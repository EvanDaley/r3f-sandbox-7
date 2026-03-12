import { Html } from "@react-three/drei";
import useCosmicAetherStore from "../stores/cosmicAetherStore";
import { RESOURCE_TYPES } from "../config/stageConfig";
import StagePortalPanel from "./StagePortalPanel";

export default function CosmicAetherHud() {
  const aether = useCosmicAetherStore((state) => state.aether);
  const integrity = useCosmicAetherStore((state) => state.integrity);
  const message = useCosmicAetherStore((state) => state.message);
  const inventory = useCosmicAetherStore((state) => state.inventory);

  return (
    <Html fullscreen style={{ pointerEvents: "none", fontFamily: "Inter, system-ui, sans-serif" }}>
      <div style={hudWrapperStyle}>
        <div style={meterPanelStyle}>
          <Meter label="Aether" value={aether} color="#72d7ff" />
          <Meter label="Integrity" value={integrity} color="#f6cf84" />
          <p style={messageStyle}>{message}</p>
          <small style={hintStyle}>Middle-click to lock cursor. WASD + Space/E + Q/Shift to drift.</small>
        </div>

        <div style={inventoryStyle}>
          {Object.values(RESOURCE_TYPES).map((resource) => (
            <div key={resource} style={inventoryRowStyle}>
              <span>{resource}</span>
              <strong>{inventory[resource] ?? 0}</strong>
            </div>
          ))}
        </div>
      </div>
      <StagePortalPanel />
    </Html>
  );
}

function Meter({ label, value, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span>{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.5)" }}>
        <div
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

const hudWrapperStyle = {
  position: "absolute",
  inset: 16,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
};

const meterPanelStyle = {
  width: 320,
  color: "#2f344d",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(126,126,160,0.35)",
  borderRadius: 12,
  padding: 12,
  backdropFilter: "blur(5px)",
};

const inventoryStyle = {
  minWidth: 210,
  color: "#2f344d",
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(126,126,160,0.35)",
  borderRadius: 12,
  padding: "10px 12px",
  backdropFilter: "blur(5px)",
};

const inventoryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  fontSize: 13,
  marginBottom: 5,
};

const messageStyle = { margin: "8px 0", minHeight: 38, fontSize: 13 };
const hintStyle = { color: "#3f5374" };
