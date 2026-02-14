import PaletteSelect from "./color_controls/PaletteSelect"
import PlayerGuide from "../../components/overlays/PlayerGuide";

export default function PaletteSandboxOverlay() {
  return (
    <>
      <PlayerGuide
        lines={[
          <>Use the <span style={{color: "#06d6a0"}}>Palette Switcher</span> to try different colors.</>,
          <>When finished, use the <span style={{color: "#ffd166"}}>Scene Switcher</span> to pick another scene.</>,
        ]}
      />

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
        <PaletteSelect/>
      </div>
    </>
  )
}
