import { Leva } from "leva";
import { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
import { useEffect, useState } from "react";
import ThreeCanvas from "./modules/ThreeCanvas";
import useSceneStore from "./stores/sceneStore";
import RpgHud from "./modules/rpg/components/RpgHud";
import LevelUpMessageQueue from "./modules/rpg/components/LevelUpMessageQueue";
import NetworkingGateway from "./modules/networking/components/NetworkingGateway";
import CommsOverlay from "./modules/networking/components/CommsOverlay";

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
      <EcctrlJoystickControls />
      <ThreeCanvas />
      <NetworkingGateway />
      <CommsOverlay />
      {currentSceneId === "rpg" && <RpgHud />}
      {currentSceneId === "modelingSandbox1" && <RpgHud position="top-right" />}
      {(currentSceneId === "rpg" || currentSceneId === "modelingSandbox1") && <LevelUpMessageQueue />}
    </>
  );
}

export default App;
