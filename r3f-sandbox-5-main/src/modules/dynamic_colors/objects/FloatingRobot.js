import React from "react"
import {Float} from "@react-three/drei"
import LittleRobot from "./LittleRobot"

export default function FloatingRobot({
                                        materials,
                                        floatSpeed = 4,
                                        rotationIntensity = .1,
                                        floatIntensity = .1,
                                        ...props
                                      }) {
  return (
    <Float
      speed={floatSpeed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
      floatingRange={[.1, 0.3]}
    >
      <LittleRobot materials={materials} {...props} />
    </Float>
  )
}
