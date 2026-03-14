import { useRef } from "react";

/**
 * A visible "sticky" pad in the scene. Limbs can be dragged and released here to attach.
 * Position is in world space (or parent group space). No physics body - attachment
 * uses anchor bodies in Guy that are moved to this position when a limb sticks.
 */
export function GrabTarget({ position = [0, 0, 0], size = 0.8, color = "#4ade80", ...props }) {
  const ref = useRef();
  return (
    <group ref={ref} position={position} {...props}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[size, size * 1.1, size * 0.3, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size * 0.6, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}
