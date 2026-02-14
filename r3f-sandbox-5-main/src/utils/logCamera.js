export function startCameraLogger(camera, intervalMs = 1000) {
  if (!camera) {
    console.warn("startCameraLogger: no camera provided");
    return () => {};
  }

  const interval = setInterval(() => {
    const pos = camera.position.toArray().map(v => v.toFixed(2));
    const rot = {
      x: camera.rotation.x.toFixed(2),
      y: camera.rotation.y.toFixed(2),
      z: camera.rotation.z.toFixed(2),
    };
    console.log("📸 Camera:", JSON.stringify({ position: pos, rotation: rot }));
  }, intervalMs);

  return () => clearInterval(interval); // cleanup function
}
