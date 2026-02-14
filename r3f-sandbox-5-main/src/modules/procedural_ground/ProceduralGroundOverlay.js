import PlayerGuide from "../../components/overlays/PlayerGuide";
import PaletteSelect from "../dynamic_colors/color_controls/PaletteSelect";

export default function ProceduralGroundOverlay() {
  return (
    <>
      <PlayerGuide
        lines={[
          <>The procedural ground is generated from <span style={{color: "#06d6a0"}}>Perlin Noise</span></>,
          <>Use the <span style={{color: "#ffd166"}}>Debug Controls</span> to switch between debug and terrain.</>,
        ]}
      />

      {/*<div*/}
      {/*  style={{*/}
      {/*    position: "absolute",*/}
      {/*    top: 20,*/}
      {/*    right: 20,*/}
      {/*    zIndex: 100,*/}
      {/*    display: "flex",*/}
      {/*    flexDirection: "column",*/}
      {/*    gap: "10px",*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <PaletteSelect/>*/}
      {/*</div>*/}
    </>
  )
}