import PlayerGuide from "../../components/overlays/PlayerGuide";
import AbilityBarOverlay from "./controls/AbilityBarOverlay";

export default function AbilitiesSandboxOverlay() {
  return (
    <>
      <AbilityBarOverlay />

      <PlayerGuide
        placement={'top'}
        lines={[
          <>Try using an <span style={{color: "#06d6a0"}}>Ability</span>.</>,
        ]}
      />
    </>
  )
}
