import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Vector3 } from "three";
import useCosmicAetherStore from "../stores/cosmicAetherStore";

export default function AetherSystem({ safeRadius = 18, spawn = [0, 3, 10] }) {
  const { camera } = useThree();
  const drainAether = useCosmicAetherStore((state) => state.drainAether);
  const aether = useCosmicAetherStore((state) => state.aether);
  const setMessage = useCosmicAetherStore((state) => state.setMessage);
  const refillAether = useCosmicAetherStore((state) => state.refillAether);
  const center = useMemo(() => new Vector3(0, 2, 0), []);

  useFrame((_, delta) => {
    const distance = camera.position.distanceTo(center);

    if (distance > safeRadius) {
      const distanceFactor = Math.min(2.4, distance / safeRadius);
      drainAether(delta * 6 * distanceFactor);
    }

    if (aether <= 0) {
      camera.position.set(...spawn);
      refillAether();
      setMessage("Aether depleted. Rescue recall triggered to your current sanctuary.");
    }
  });

  return null;
}
