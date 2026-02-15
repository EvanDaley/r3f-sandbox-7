import { Leva } from "leva";
import { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
import { useEffect, useState } from "react";
import ThreeCanvas from "./modules/ThreeCanvas";
import useSceneStore from "./stores/sceneStore";
import RpgHud from "./modules/rpg/components/RpgHud";
import NetworkingGateway from "./modules/networking/components/NetworkingGateway";
import NetworkCommsOverlay from "./modules/networking/components/NetworkCommsOverlay";

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
  const currentSceneEntry = useSceneStore((state) =>
    state.scenes.find((scene) => scene.id === state.currentSceneId)
  );

  const HtmlSceneComponent =
    currentSceneEntry?.renderer === "html" ? currentSceneEntry.scene : null;

  return (
    <>
      <Leva hidden />
      <EcctrlJoystickControls />
      <ThreeCanvas />
      {HtmlSceneComponent ? <HtmlSceneComponent /> : null}
      {currentSceneId !== "webrtcScreenShareLab" && <NetworkingGateway />}
      {currentSceneId !== "webrtcScreenShareLab" && <NetworkCommsOverlay />}
      {currentSceneId === "rpg" && <RpgHud />}
    </>
  );
}

export default App;
