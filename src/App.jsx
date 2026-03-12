import { Leva } from "leva";
import { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
import { useEffect, useState } from "react";
import ThreeCanvas from "./modules/ThreeCanvas";
import useSceneStore from "./stores/sceneStore";
import RpgHud from "./modules/rpg/components/RpgHud";
import LevelUpMessageQueue from "./modules/rpg/components/LevelUpMessageQueue";
import NetworkingGateway from "./modules/networking/components/NetworkingGateway";
import CommsOverlay from "./modules/networking/components/CommsOverlay";
import TowerDefenseHud from "./modules/tower_defense_sandbox_1/components/TowerDefenseHud";
import SceneSelector from "./components/SceneSelector";
import CosmicAetherHud from "./modules/cosmic_aether/components/CosmicAetherHud";

const EcctrlJoystickControls = () => {
  const [isTouchScreen, setIsTouchScreen] = useState(false);
  useEffect(() => {
    // Check if using a touch control device, show/hide joystick
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
      setIsTouchScreen(true);
    } else {
      setIsTouchScreen(false);
    }
  }, []);
  return <>{isTouchScreen && <EcctrlJoystick buttonNumber={5} />}</>;
};

function App() {
  const currentSceneId = useSceneStore((state) => state.currentSceneId);
  const setSceneId = useSceneStore((state) => state.setSceneId);

  useEffect(() => {
    const onGoRpg = () => setSceneId('rpg');
    window.addEventListener('scene:go-rpg', onGoRpg);
    return () => window.removeEventListener('scene:go-rpg', onGoRpg);
  }, [setSceneId]);

  return (
    <>
      <Leva hidden />
      <SceneSelector />
      <EcctrlJoystickControls />
      <ThreeCanvas />
      <NetworkingGateway />
      <CommsOverlay />
      {currentSceneId === "rpg" && <RpgHud />}
      {currentSceneId === "modelingSandbox1" && <RpgHud position="top-right" />}
      {(currentSceneId === "rpg" || currentSceneId === "modelingSandbox1") && <LevelUpMessageQueue />}
      {currentSceneId === "towerDefenseSandbox1" && <TowerDefenseHud />}
      {currentSceneId === "cosmicAether" && <CosmicAetherHud />}
    </>
  );
}

export default App;
