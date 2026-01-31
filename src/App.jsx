import { Leva } from "leva";
import { EcctrlJoystick } from "@/modules/third_person_controller/EcctrlJoystick";
import { useEffect, useState } from "react";
import ThreeCanvas from "./modules/ThreeCanvas";

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
  return (
    <>
      <Leva collapsed />
      <EcctrlJoystickControls />
      <ThreeCanvas />
    </>
  );
}

export default App;
