import { useCallback, useEffect, useMemo, useState } from "react";
import { broadcastNetworkMessage, subscribeToNetworkMessages } from "@/modules/networking/core/networkEvents";

const CHANNEL = "shared-color-box";

const randomColor = () => `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`;

export default function NetworkColorBox() {
  const [color, setColor] = useState("#ff5f66");

  const materialProps = useMemo(
    () => ({
      color,
      roughness: 0.35,
      metalness: 0.2,
      emissive: color,
      emissiveIntensity: 0.12,
    }),
    [color]
  );

  const syncColor = useCallback((nextColor, source) => {
    console.log("[network/box] applying color", { nextColor, source });
    setColor(nextColor);
  }, []);

  const updateColorAndBroadcast = useCallback(() => {
    const nextColor = randomColor();
    syncColor(nextColor, "local-click");

    broadcastNetworkMessage({
      channel: CHANNEL,
      type: "box-color-updated",
      payload: { color: nextColor },
    });
  }, [syncColor]);

  useEffect(() => {
    const unsubscribe = subscribeToNetworkMessages((message) => {
      if (message.channel !== CHANNEL) return;
      if (message.type !== "box-color-updated") return;

      const incomingColor = message.payload?.color;
      if (!incomingColor) return;

      syncColor(incomingColor, `peer:${message.fromPeerId}`);
    });

    return unsubscribe;
  }, [syncColor]);

  return (
    <mesh castShadow receiveShadow position={[0, 4.5, -6]} onClick={updateColorAndBroadcast}>
      <boxGeometry args={[4, 4, 4]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
}
