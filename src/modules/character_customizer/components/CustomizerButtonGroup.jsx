const groupStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
};

const buttonStyle = {
  background: "rgba(255,255,255,0.1)",
  color: "#f8fafc",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 12,
  cursor: "pointer",
};

export default function CustomizerButtonGroup({ options, selectedId, onSelect }) {
  return (
    <div style={groupStyle}>
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            aria-pressed={isSelected}
            style={{
              ...buttonStyle,
              borderColor: isSelected ? "#38bdf8" : "rgba(255,255,255,0.2)",
              background: isSelected ? "rgba(56, 189, 248, 0.22)" : buttonStyle.background,
              boxShadow: isSelected ? "inset 0 0 0 1px rgba(56, 189, 248, 0.5)" : "none",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
