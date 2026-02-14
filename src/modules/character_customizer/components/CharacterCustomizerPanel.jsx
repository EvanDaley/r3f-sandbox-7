import { customizationCategories, customizationOptions } from "../config/customizationOptions";
import useCharacterCustomizerStore from "../stores/useCharacterCustomizerStore";
import CustomizerButtonGroup from "./CustomizerButtonGroup";

const panelStyle = {
  width: 380,
  maxWidth: "calc(100vw - 24px)",
  color: "#f8fafc",
  background: "rgba(11, 18, 32, 0.9)",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.18)",
  padding: "14px",
  position: "fixed",
  top: 16,
  right: 16,
  zIndex: 30,
  backdropFilter: "blur(4px)",
  boxSizing: "border-box",
};

export default function CharacterCustomizerPanel() {
  const selection = useCharacterCustomizerStore((state) => state.selection);
  const setSelection = useCharacterCustomizerStore((state) => state.setSelection);

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
        <strong>Character Customizer</strong>
        <span style={{ fontSize: 11, opacity: 0.8 }}>Front view preview</span>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {customizationCategories.map((category) => (
          <div key={category.id}>
            <div style={{ fontSize: 12, marginBottom: 6, opacity: 0.85 }}>{category.label}</div>
            <CustomizerButtonGroup
              options={customizationOptions[category.id]}
              selectedId={selection[category.id]}
              onSelect={(optionId) => setSelection(category.id, optionId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
