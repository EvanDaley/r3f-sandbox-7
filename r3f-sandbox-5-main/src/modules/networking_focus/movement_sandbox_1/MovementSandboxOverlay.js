import PlayerGuide from "../../../components/overlays/PlayerGuide";

export default function MovementSandboxOverlay() {
  return (
    <>
      {/*<AbilityBarOverlay />*/}

      <PlayerGuide
        placement={'top'}
        lines={[
          <>First attempt at movement in Three.js. This one is <span style={{color: "#06d6a0"}}>client only</span>.</>,
        ]}
      />
    </>
  )
}
