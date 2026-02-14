import React, { forwardRef } from "react";
import PaletteModel from "./PaletteModel";
import {Float} from "@react-three/drei";

const LittleRobot = forwardRef(({ materials, ...props }, ref) => {
  // If PaletteModel is a custom mesh-like object that expects props but not a ref,
  // wrap it in a <group> that can safely receive a ref.
  return (
    <group ref={ref} {...props}>
      <Float
        speed={2}            // bobbing speed
        rotationIntensity={0} // disable spin
        floatIntensity={1.5}  // amplitude of up/down motion
        floatingRange={[-0.1, 0.3]} // how far up/down it moves
      >
        <PaletteModel
          file="palette_testing/ninja1.glb"
          materials={materials}
          outline
          castShadow
          receiveShadow
        />
      </Float>
    </group>
  );
});

export default LittleRobot;
