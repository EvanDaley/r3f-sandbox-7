import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useCharacterCustomizerOptions from "../hooks/useCharacterCustomizerOptions";

function HairMesh({ hair }) {
  if (hair.type === "mohawk") {
    return (
      <mesh position={[0, hair.yOffset, 0]} scale={hair.scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={hair.color} />
      </mesh>
    );
  }

  return (
    <mesh
      position={[hair.xOffset ?? 0, hair.yOffset, hair.zOffset ?? 0]}
      scale={hair.scale}
      rotation={hair.rotation ?? [0, 0, 0]}
    >
      <sphereGeometry args={[0.5, 24, 16]} />
      <meshStandardMaterial color={hair.color} />
    </mesh>
  );
}

function HeadwearMesh({ headwear }) {
  if (headwear.type === "topHat") {
    return (
      <group position={[0, headwear.yOffset, 0]}>
        <mesh scale={headwear.brimScale}>
          <cylinderGeometry args={[0.5, 0.55, 0.2, 24]} />
          <meshStandardMaterial color={headwear.color} />
        </mesh>
        <mesh position={[0, 0.3, 0]} scale={headwear.crownScale}>
          <cylinderGeometry args={[0.5, 0.5, 1, 24]} />
          <meshStandardMaterial color={headwear.color} />
        </mesh>
      </group>
    );
  }

  if (headwear.type === "beanie") {
    return (
      <mesh position={[0, headwear.yOffset, 0]} scale={headwear.scale}>
        <sphereGeometry args={[0.5, 24, 18]} />
        <meshStandardMaterial color={headwear.color} />
      </mesh>
    );
  }

  return (
    <group position={[0, headwear.yOffset, 0]}>
      <mesh position={[0.45, 0, 0]} scale={headwear.earScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={headwear.color} />
      </mesh>
      <mesh position={[-0.45, 0, 0]} scale={headwear.earScale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={headwear.color} />
      </mesh>
      <mesh position={[0, 0.38, 0]} scale={headwear.bandScale}>
        <torusGeometry args={[0.5, 0.12, 16, 24, Math.PI]} />
        <meshStandardMaterial color={headwear.color} />
      </mesh>
    </group>
  );
}

export default function CustomizableCharacter() {
  const { selectedBaseModel, selectedHeadwear, selectedHairStyle } = useCharacterCustomizerOptions();
  const bodyRef = useRef();
  const headRef = useRef();

  const headY = selectedBaseModel.head.y;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const sway = Math.sin(t * 1.8) * 0.06;

    if (bodyRef.current) {
      bodyRef.current.rotation.y = sway;
    }

    if (headRef.current) {
      headRef.current.rotation.z = Math.sin(t * 2.2) * 0.05;
      headRef.current.position.y = headY + Math.sin(t * 2) * 0.03;
    }
  });

  const headScale = useMemo(
    () => [selectedBaseModel.head.width, selectedBaseModel.head.height, selectedBaseModel.head.depth],
    [selectedBaseModel.head.depth, selectedBaseModel.head.height, selectedBaseModel.head.width]
  );

  return (
    <group position={[0, -0.65, 0]}>
      <mesh ref={bodyRef} position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry
          args={[
            selectedBaseModel.body.radiusTop,
            selectedBaseModel.body.radiusBottom,
            selectedBaseModel.body.height,
            32,
          ]}
        />
        <meshStandardMaterial color={selectedBaseModel.colors.body} />
      </mesh>

      <group ref={headRef} position={[0, headY, 0]}>
        <mesh castShadow scale={headScale}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={selectedBaseModel.colors.head} />
        </mesh>

        <HairMesh hair={selectedHairStyle} />
        <HeadwearMesh headwear={selectedHeadwear} />
      </group>
    </group>
  );
}
