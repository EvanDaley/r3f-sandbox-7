// components/SpriteImage.js
import React, { useMemo } from "react";
import * as THREE from "three";

/**
 * Reusable sprite loader that takes an image path and props.
 * Keeps `window.location.href + imagePath` logic intact.
 */
export default function SpriteImage({
                                      imagePath,
                                      opacity = 1,
                                      depthTest = false,
                                      depthWrite = false,
                                      ...props
                                    }) {
  // Load texture with same href-based logic
  const texture = useMemo(
    () => new THREE.TextureLoader().load(window.location.href + imagePath),
    [imagePath]
  );

  // Build the material once
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: texture,
        depthTest,
        depthWrite,
        opacity,
      }),
    [texture, depthTest, depthWrite, opacity]
  );

  return <sprite material={material} {...props} />;
}
