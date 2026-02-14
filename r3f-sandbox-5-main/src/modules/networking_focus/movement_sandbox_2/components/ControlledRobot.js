import React, { useRef } from "react";
import { useRobotMovement } from "../hooks/useRobotMovement";
import FloatingRobot from "../../../dynamic_colors/objects/FloatingRobot";

export default function ControlledRobot() {
  const robotRef = useRef();
  useRobotMovement(robotRef);

  return (
    <FloatingRobot ref={robotRef} position={[0, 0, 0]} />
  );
}
