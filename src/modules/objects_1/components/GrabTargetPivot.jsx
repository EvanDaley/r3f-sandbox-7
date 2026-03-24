import { useLayoutEffect, useMemo } from "react";
import { PivotControls } from "@react-three/drei";
import * as THREE from "three";
import { GrabTarget } from "./GrabTarget";

/**
 * When `held` is true, shows drei's PivotControls (same family as CSG sandbox) so the
 * pad can be translated in world space. When false, renders a static GrabTarget.
 */
export function GrabTargetPivot({
  position,
  color,
  held,
  onMove,
  onGizmoDragStart,
  onGizmoDragEnd,
}) {
  const matrix = useMemo(() => new THREE.Matrix4(), []);
  useLayoutEffect(() => {
    matrix.makeTranslation(position[0], position[1], position[2]);
  }, [matrix, position]);

  if (!held) {
    return (
      <group position={position}>
        <GrabTarget position={[0, 0, 0]} color={color} />
      </group>
    );
  }

  return (
    <PivotControls
      matrix={matrix}
      autoTransform
      onDragStart={() => {
        onGizmoDragStart?.();
      }}
      onDrag={(mL) => {
        const p = new THREE.Vector3();
        mL.decompose(p, new THREE.Quaternion(), new THREE.Vector3());
        onMove([p.x, p.y, p.z]);
      }}
      onDragEnd={() => {
        onGizmoDragEnd?.();
      }}
      disableAxes
      disableRotations
      disableScaling
      activeAxes={[true, true, true]}
      scale={3.75}
      depthTest
    >
      <GrabTarget position={[0, 0, 0]} color={color} />
    </PivotControls>
  );
}
