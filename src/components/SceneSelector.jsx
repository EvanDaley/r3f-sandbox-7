import useSceneStore from "../stores/sceneStore";

export default function SceneSelector() {
  const currentSceneId = useSceneStore((state) => state.currentSceneId);
  const scenes = useSceneStore((state) => state.scenes);
  const setSceneId = useSceneStore((state) => state.setSceneId);

  const handleChange = (e) => {
    setSceneId(e.target.value);
  };

  return (
    <div style={containerStyle}>
      <select
        value={currentSceneId}
        onChange={handleChange}
        style={selectStyle}
      >
        {scenes.map((scene) => (
          <option key={scene.id} value={scene.id}>
            {scene.name}
          </option>
        ))}
      </select>
    </div>
  );
}

const containerStyle = {
  position: "fixed",
  top: 12,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 100,
};

const selectStyle = {
  padding: "8px 16px",
  borderRadius: 8,
  background: "rgba(0, 0, 0, 0.7)",
  color: "white",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  fontSize: 14,
  cursor: "pointer",
  outline: "none",
  minWidth: 200,
  fontFamily: "system-ui, -apple-system, sans-serif",
};
