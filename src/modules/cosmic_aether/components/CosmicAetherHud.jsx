import { useMemo } from "react";
import useCosmicAetherStore from "../stores/cosmicAetherStore";
import { RESOURCE_TYPES } from "../config/stageConfig";

const TABS = [
  { id: "objectives", label: "Objectives" },
  { id: "fabricator", label: "Fabricator" },
  { id: "routes", label: "Routes" },
];

export default function CosmicAetherHud() {
  const aether = useCosmicAetherStore((state) => state.aether);
  const maxAether = useCosmicAetherStore((state) => state.maxAether);
  const integrity = useCosmicAetherStore((state) => state.integrity);
  const message = useCosmicAetherStore((state) => state.message);
  const inventory = useCosmicAetherStore((state) => state.inventory);
  const craftRecipe = useCosmicAetherStore((state) => state.craftRecipe);
  const canAccessStage = useCosmicAetherStore((state) => state.canAccessStage);
  const setStage = useCosmicAetherStore((state) => state.setStage);
  const currentStageId = useCosmicAetherStore((state) => state.currentStageId);
  const objectiveIndex = useCosmicAetherStore((state) => state.objectiveIndex);
  const tab = useCosmicAetherStore((state) => state.menuTab);
  const setMenuTab = useCosmicAetherStore((state) => state.setMenuTab);

  // Memoize function results to prevent infinite loops
  const recipes = useMemo(() => useCosmicAetherStore.getState().getRecipes(), []);
  const stages = useMemo(() => useCosmicAetherStore.getState().getStageList(), []);
  const objectives = useMemo(() => useCosmicAetherStore.getState().getObjectives(), []);

  return (
    <div style={overlayStyle}>
      <div style={topBarStyle}>
        <Meter label="Aether" value={aether} max={maxAether} color="#72d7ff" />
        <Meter label="Integrity" value={integrity} max={100} color="#f6cf84" />
      </div>

      <div style={mainPanelStyle}>
        <div style={tabHeaderStyle}>
          {TABS.map((tabOption) => (
            <button
              key={tabOption.id}
              onClick={() => setMenuTab(tabOption.id)}
              style={{ ...tabButtonStyle, ...(tabOption.id === tab ? selectedTabStyle : null) }}
            >
              {tabOption.label}
            </button>
          ))}
        </div>

        {tab === "objectives" && (
          <div>
            <h3 style={sectionTitleStyle}>Progression Chain</h3>
            {objectives.map((objective, idx) => (
              <div key={objective} style={objectiveRowStyle}>
                <span>{idx < objectiveIndex ? "✅" : idx === objectiveIndex ? "➡️" : "▫️"}</span>
                <span>{objective}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "fabricator" && (
          <div>
            <h3 style={sectionTitleStyle}>Fabricator</h3>
            {recipes.map((recipe) => {
              const costText = Object.entries(recipe.cost)
                .map(([resource, amount]) => `${resource} x${amount}`)
                .join(" • ");
              return (
                <button key={recipe.id} style={recipeButtonStyle} onClick={() => craftRecipe(recipe.id)}>
                  <div style={{ fontWeight: 700 }}>{recipe.name}</div>
                  <small>{recipe.description}</small>
                  <small style={{ opacity: 0.8 }}>{costText}</small>
                </button>
              );
            })}
          </div>
        )}

        {tab === "routes" && (
          <div>
            <h3 style={sectionTitleStyle}>Route Network</h3>
            {stages.map((stage) => {
              const locked = !canAccessStage(stage.id);
              return (
                <button
                  key={stage.id}
                  disabled={locked || stage.id === currentStageId}
                  onClick={() => setStage(stage.id)}
                  style={{ ...routeButtonStyle, opacity: locked ? 0.45 : 1 }}
                >
                  <strong>{stage.name}</strong>
                  <small>{stage.description}</small>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div style={rightPanelStyle}>
        <h3 style={sectionTitleStyle}>Inventory</h3>
        {Object.values(RESOURCE_TYPES).map((resource) => (
          <div key={resource} style={inventoryRowStyle}>
            <span>{resource}</span>
            <strong>{inventory[resource] ?? 0}</strong>
          </div>
        ))}
        <p style={messageStyle}>{message}</p>
        <small>WASD move • Space/E ascend • Q/Shift descend • F interact</small>
      </div>
    </div>
  );
}

function Meter({ label, value, max, color }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={meterStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span>{label}</span>
        <span>{Math.round(value)} / {max}</span>
      </div>
      <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.38)" }}>
        <div style={{ width: `${percent}%`, height: "100%", borderRadius: 999, background: color }} />
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 90,
  color: "#28324a",
  fontFamily: "Inter, system-ui, sans-serif",
};

const topBarStyle = {
  position: "absolute",
  top: 14,
  left: 16,
  display: "flex",
  gap: 10,
};

const meterStyle = {
  width: 250,
  padding: "8px 10px",
  background: "rgba(255,255,255,0.76)",
  border: "1px solid rgba(112,124,169,0.36)",
  borderRadius: 10,
};

const panelBase = {
  pointerEvents: "auto",
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(112,124,169,0.36)",
  borderRadius: 12,
  backdropFilter: "blur(6px)",
};

const mainPanelStyle = {
  ...panelBase,
  position: "absolute",
  left: 16,
  top: 74,
  width: 430,
  maxHeight: "calc(100vh - 90px)",
  overflowY: "auto",
  padding: 12,
};

const rightPanelStyle = {
  ...panelBase,
  position: "absolute",
  right: 16,
  top: 14,
  width: 280,
  padding: 12,
};

const tabHeaderStyle = { display: "flex", gap: 8, marginBottom: 10 };
const tabButtonStyle = {
  border: "1px solid rgba(86,93,128,0.4)",
  borderRadius: 8,
  background: "rgba(244,246,255,0.95)",
  color: "#2f3756",
  padding: "6px 10px",
  cursor: "pointer",
  fontWeight: 700,
};
const selectedTabStyle = { background: "#dae6ff" };
const sectionTitleStyle = { margin: "0 0 8px", fontSize: 14 };
const objectiveRowStyle = { display: "grid", gridTemplateColumns: "24px 1fr", gap: 8, marginBottom: 8, fontSize: 13 };
const inventoryRowStyle = { display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 };
const messageStyle = { margin: "10px 0", minHeight: 36, fontSize: 13 };
const recipeButtonStyle = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 2,
  border: "1px solid rgba(86,93,128,0.35)",
  borderRadius: 8,
  marginBottom: 8,
  background: "rgba(245,247,255,0.95)",
  padding: 10,
  cursor: "pointer",
};
const routeButtonStyle = {
  ...recipeButtonStyle,
};
