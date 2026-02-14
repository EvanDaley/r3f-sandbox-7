import { Box, ContactShadows, Environment, Sky, MeshReflectorMaterial } from "@react-three/drei";
import OrthoV2 from "../../../components/controls/OrthoV2";

export default function Minimal1() {
    return (
        <>
            <Environment preset="city" />
            <pointLight position={[10, 10, 10]} />
            <Sky/>
            <OrthoV2/>
            {/* Scatter boxes across the ground with different colors */}
            {(() => {
                // Use a list to keep track of placed boxes
                const positions = [];
                const boxes = [];
                const triesPerBox = 40;
                const minDistance = 1.1; // Minimum distance so they don't overlap (box is 1 wide)

                for (let i = 0; i < 20; i++) {
                    let x, z, y = 0.2;
                    let attempts = 0;
                    let valid = false;

                    // Try to find a non-overlapping position
                    while (attempts < triesPerBox && !valid) {
                        x = (Math.random() - 0.5) * 8;
                        z = (Math.random() - 0.5) * 8;
                        valid = positions.every(([px, pz]) => {
                            const dx = x - px;
                            const dz = z - pz;
                            return Math.sqrt(dx * dx + dz * dz) >= minDistance;
                        });
                        attempts++;
                    }
                    if (!valid && positions.length > 0) {
                        // fall back to last valid position (should rarely happen)
                        [x, z] = positions[positions.length - 1];
                    }

                    positions.push([x, z]);

                    // Generate a random color
                    const color = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

                    boxes.push(
                        <Box
                            key={i}
                            position={[x, y, z]}
                            args={[1, 1, 1]}
                            castShadow
                            receiveShadow
                        >
                            <meshStandardMaterial color={color} />
                        </Box>
                    );
                }
                return boxes;
            })()}
            <ContactShadows frames={1} position={[0, -0.5, 0]} scale={12} opacity={0.4} far={2} blur={3} />

                    {/* <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}> */}
            {/* <planeGeometry args={[50, 50]} />
                <MeshReflectorMaterial
                    blur={[300, 30]}
                    resolution={2048}
                    mixBlur={1}
                    mixStrength={180}
                    roughness={1}
                    depthScale={1.2}
                    minDepthThreshold={0.4}
                    maxDepthThreshold={1.4}
                    color="#202020"
                    metalness={0.8}
                />
            </mesh> */}
        </>
    )
}