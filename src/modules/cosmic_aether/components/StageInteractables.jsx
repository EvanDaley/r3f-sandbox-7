import { Html, Float } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Vector3 } from "three";
import useCosmicAetherStore from "../stores/cosmicAetherStore";

export function ResourceNode({ position, resource, color = "#d6f7ff", amount = 1 }) {
  const gatherResource = useCosmicAetherStore((state) => state.gatherResource);
  const setMessage = useCosmicAetherStore((state) => state.setMessage);
  const [depleted, setDepleted] = useState(false);

  const handleGather = () => {
    if (depleted) return;
    gatherResource(resource, amount);
    setMessage(`Gathered ${amount} ${resource}.`);
    setDepleted(true);
    window.setTimeout(() => setDepleted(false), 8000);
  };

  return (
    <group position={position} onClick={handleGather}>
      <Float speed={1} rotationIntensity={0.6}>
        <mesh castShadow>
          <icosahedronGeometry args={[depleted ? 0.2 : 0.75, 1]} />
          <meshStandardMaterial color={depleted ? "#d8d8d8" : color} emissive={depleted ? "#000000" : color} emissiveIntensity={0.3} />
        </mesh>
      </Float>
    </group>
  );
}

export function UnlockShrine({ position, unlockKey, label, requiredCost, onUnlock }) {
  const spendResources = useCosmicAetherStore((state) => state.spendResources);
  const unlockTech = useCosmicAetherStore((state) => state.unlockTech);
  const setMessage = useCosmicAetherStore((state) => state.setMessage);
  const unlocks = useCosmicAetherStore((state) => state.unlocks);
  const { camera } = useThree();
  const [isNear, setIsNear] = useState(false);
  const target = useMemo(() => new Vector3(...position), [position]);
  const keyPressed = useRef(false);

  useFrame(() => {
    setIsNear(camera.position.distanceTo(target) < 4.5);
  });

  useEffect(() => {
    const handleDown = (event) => {
      if (event.code !== "KeyF" || keyPressed.current || !isNear) return;
      keyPressed.current = true;
      if (unlocks[unlockKey]) {
        setMessage(`${label} already unlocked.`);
        return;
      }
      const spent = spendResources(requiredCost);
      if (!spent) {
        setMessage(`Need ${Object.entries(requiredCost).map(([k, v]) => `${k} x${v}`).join(", ")}.`);
        return;
      }
      unlockTech(unlockKey);
      setMessage(`${label} unlocked. New route attuned.`);
      onUnlock?.();
    };

    const handleUp = (event) => {
      if (event.code === "KeyF") keyPressed.current = false;
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [isNear, label, onUnlock, requiredCost, setMessage, spendResources, unlockKey, unlockTech, unlocks]);

  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.9, 1.2, 3.4, 18]} />
        <meshStandardMaterial color="#f2f0fb" metalness={0.35} roughness={0.42} emissive="#cbd4ff" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 2.1, 0]}>
        <torusGeometry args={[0.85, 0.12, 16, 32]} />
        <meshStandardMaterial color="#f4dd9a" emissive="#f4dd9a" emissiveIntensity={0.35} />
      </mesh>
      {isNear && (
        <Html position={[0, 2.9, 0]} center>
          <div style={promptStyle}>Press F — {label}</div>
        </Html>
      )}
    </group>
  );
}

const promptStyle = {
  color: "#2d334a",
  background: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(96,102,138,0.4)",
  borderRadius: 8,
  padding: "6px 8px",
  fontSize: 12,
  fontWeight: 600,
  whiteSpace: "nowrap",
};
