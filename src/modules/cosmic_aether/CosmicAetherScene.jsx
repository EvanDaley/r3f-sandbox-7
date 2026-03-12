import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import CosmicAetherEnvironment from "./components/CosmicAetherEnvironment";
import CosmicAetherHud from "./components/CosmicAetherHud";
import { STAGE_BY_ID } from "./config/stageConfig";
import ChoirRuinsStage from "./stages/ChoirRuinsStage";
import PaleGardenStage from "./stages/PaleGardenStage";
import SanctuaryHaloStage from "./stages/SanctuaryHaloStage";
import useCosmicAetherStore from "./stores/cosmicAetherStore";
import AetherSystem from "./systems/AetherSystem";
import PlayerController from "./systems/PlayerController";

const STAGE_COMPONENTS = {
  sanctuaryHalo: SanctuaryHaloStage,
  paleGarden: PaleGardenStage,
  choirRuins: ChoirRuinsStage,
};

const PLAYER_SPAWN = [0, 3, 10];

function StageCameraReset() {
  const currentStageId = useCosmicAetherStore((state) => state.currentStageId);
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...PLAYER_SPAWN);
    camera.lookAt(0, 3, 0);
  }, [camera, currentStageId]);

  return null;
}

export default function CosmicAetherScene() {
  const currentStageId = useCosmicAetherStore((state) => state.currentStageId);
  const stageData = STAGE_BY_ID[currentStageId];
  const StageComponent = STAGE_COMPONENTS[currentStageId] ?? SanctuaryHaloStage;

  return (
    <>
      <StageCameraReset />
      <CosmicAetherEnvironment fogDensity={stageData.fogDensity} accent={stageData.accent} />
      <StageComponent />
      <PlayerController />
      <AetherSystem spawn={PLAYER_SPAWN} />
      <CosmicAetherHud />
    </>
  );
}
