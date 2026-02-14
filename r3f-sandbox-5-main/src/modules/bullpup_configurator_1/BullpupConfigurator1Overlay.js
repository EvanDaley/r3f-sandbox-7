import PaletteSelect from "../dynamic_colors/color_controls/PaletteSelect"

export default function BullpupConfigurator1Overlay() {
  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 20,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <PaletteSelect />
    </div>
  )
}

