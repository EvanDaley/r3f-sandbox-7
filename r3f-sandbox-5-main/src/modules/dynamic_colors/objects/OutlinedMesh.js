import React from "react";
import {Outlines} from "@react-three/drei";

export default function OutlinedMesh(props) {
  return (
    <>
      <mesh
        {...props}
        receiveShadow={false}
      >
        <Outlines thickness={2.04} color="black" screenspace opacity={1} />
      </mesh>
    </>
  )
}