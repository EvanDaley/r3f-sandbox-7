import { usePaletteStore } from "../stores/paletteStore"

export default function PaletteSelect() {
    const { palettes, activeKey, setPalette } = usePaletteStore((s) => ({
        palettes: s.palettes,
        activeKey: s.activeKey,
        setPalette: s.setPalette,
    }))

    const paletteKeys = Object.keys(palettes)

    return (
        <div
            style={{
                background: "#222",
                padding: "6px 10px",
                borderRadius: "6px",
                boxShadow: "0 0 6px rgba(0,0,0,0.4)",
                color: "#fff",
                fontFamily: "sans-serif",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
            }}
        >
            <label>Palette:</label>
            <select
                value={activeKey}
                onChange={(e) => setPalette(e.target.value)}
                style={{
                    background: "#333",
                    color: "#fff",
                    border: "1px solid #555",
                    borderRadius: "4px",
                    padding: "4px 8px",
                    cursor: "pointer",
                }}
            >
                {paletteKeys.map((key) => (
                    <option key={key} value={key}>
                        {key}
                    </option>
                ))}
            </select>
        </div>
    )
}
