import React from "react";
import OrthoZoomOnly from "../../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";

export default function ChatV1() {
  return (
    <>
      <color attach="background" args={["#3c2828"]} />
      <OrthoZoomOnly />
      <SimpleLighting2 />
      <EffectsV2 />
    </>
  );
}
