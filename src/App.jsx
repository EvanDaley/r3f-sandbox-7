import { Leva } from "leva";
import { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
import { useEffect, useState } from "react";
import ThreeCanvas from "./modules/ThreeCanvas";
import useSceneStore from "./stores/sceneStore";
import Rpg2Hud from "./modules/rpg-2/components/Rpg2Hud";

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

  return (
    <>
      <Leva collapsed />
      <EcctrlJoystickControls />
      <ThreeCanvas />
      {currentSceneId === "rpg2" && <Rpg2Hud />}
    </>
  );
}

export default App;
