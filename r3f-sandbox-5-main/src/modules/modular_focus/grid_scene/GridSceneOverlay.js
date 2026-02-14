import PlayerGuide from "../../../components/overlays/PlayerGuide";
import { useGridSceneStore } from "./stores/gridSceneStore";

export default function GridSceneOverlay() {
  const selectedObjectType = useGridSceneStore((s) => s.selectedObjectType);
  const setSelectedObjectType = useGridSceneStore((s) => s.setSelectedObjectType);
  const deleteMode = useGridSceneStore((s) => s.deleteMode);
  const setDeleteMode = useGridSceneStore((s) => s.setDeleteMode);
  const rotationMode = useGridSceneStore((s) => s.rotationMode);
  const setRotationMode = useGridSceneStore((s) => s.setRotationMode);
  const overwrite = useGridSceneStore((s) => s.overwrite);
  const setOverwrite = useGridSceneStore((s) => s.setOverwrite);
  const selectionMode = useGridSceneStore((s) => s.selectionMode);
  const setSelectionMode = useGridSceneStore((s) => s.setSelectionMode);
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const clearAll = useGridSceneStore((s) => s.clearAll);
  const serialize = useGridSceneStore((s) => s.serialize);

  const handleSelectType = (type) => {
    // Toggle selection: if already selected, deselect
    if (selectedObjectType === type) {
      setSelectedObjectType(null);
    } else {
      setSelectedObjectType(type);
    }
  };

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
  };

  const handleToggleRotationMode = () => {
    setRotationMode(!rotationMode);
  };

  const handleSave = () => {
    const json = serialize();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-scene.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all objects?')) {
      clearAll();
    }
  };

  const deserialize = useGridSceneStore((s) => s.deserialize);

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            deserialize(event.target.result);
          } catch (error) {
            console.error('Failed to load scene:', error);
            alert('Failed to load scene. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
      <PlayerGuide
        lines={[
        //   <>This is a <span style={{color: "#06d6a0"}}>grid-based scene</span> for modular object placement</>,
        //   <>Objects in the <span style={{color: "#ffd166"}}>objects</span> folder are designed to fit on a grid</>,
        ]}
      />

      {/* Scene Builder Controls */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "15px",
          borderRadius: "8px",
          color: "white",
        }}
      >
        <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "5px" }}>
          Scene Builder
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "12px", opacity: 0.8 }}>Select object to place:</div>
          
          <button
            onClick={() => handleSelectType('desk')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'desk' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'desk' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'desk' ? '✓ Desk' : 'Desk'}
          </button>
          
          <button
            onClick={() => handleSelectType('turret')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'turret' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'turret' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'turret' ? '✓ Turret' : 'Turret'}
          </button>
          
          <button
            onClick={() => handleSelectType('wall')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'wall' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'wall' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'wall' ? '✓ Wall' : 'Wall'}
          </button>
          
          <button
            onClick={() => handleSelectType('corner')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'corner' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'corner' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'corner' ? '✓ Corner' : 'Corner'}
          </button>
          
          <button
            onClick={() => handleSelectType('tJunction')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'tJunction' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'tJunction' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'tJunction' ? '✓ T-Junction' : 'T-Junction'}
          </button>
          
          <button
            onClick={() => handleSelectType('fourWayJunction')}
            style={{
              padding: "8px 16px",
              backgroundColor: selectedObjectType === 'fourWayJunction' ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: selectedObjectType === 'fourWayJunction' ? "bold" : "normal",
            }}
          >
            {selectedObjectType === 'fourWayJunction' ? '✓ 4-Way Junction' : '4-Way Junction'}
          </button>

          {selectedObjectType && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px" }}>
              Click on the grid to place
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "10px", paddingTop: "10px" }}>
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>Tools:</div>
          
          <button
            onClick={() => setSelectionMode(!selectionMode)}
            style={{
              padding: "8px 16px",
              backgroundColor: selectionMode ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontWeight: selectionMode ? "bold" : "normal",
            }}
          >
            {selectionMode ? '✓ Select Tool' : 'Select Tool'}
          </button>
          
          {selectionMode && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px", marginBottom: "8px" }}>
              Drag to select box, Shift+Click to toggle, Press M to move
            </div>
          )}
          
          {selectedObjectIds.length > 0 && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px", marginBottom: "8px", color: "#06d6a0" }}>
              {selectedObjectIds.length} object{selectedObjectIds.length !== 1 ? 's' : ''} selected
            </div>
          )}
          
          <button
            onClick={handleToggleRotationMode}
            style={{
              padding: "8px 16px",
              backgroundColor: rotationMode ? "#118ab2" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              marginTop: "8px",
              fontWeight: rotationMode ? "bold" : "normal",
            }}
          >
            {rotationMode ? '✓ Rotate Tool' : 'Rotate Tool'}
          </button>
          
          {rotationMode && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px", marginBottom: "8px" }}>
              Click on objects to rotate 90°
            </div>
          )}
          
          <button
            onClick={handleToggleDeleteMode}
            style={{
              padding: "8px 16px",
              backgroundColor: deleteMode ? "#ef476f" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              marginTop: "8px",
              fontWeight: deleteMode ? "bold" : "normal",
            }}
          >
            {deleteMode ? '✓ Delete Tool' : 'Delete Tool'}
          </button>
          
          {deleteMode && (
            <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px", marginBottom: "8px" }}>
              Click on objects to delete
            </div>
          )}
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "10px", paddingTop: "10px" }}>
          <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "8px" }}>Settings:</div>
          <button
            onClick={() => setOverwrite(!overwrite)}
            style={{
              padding: "8px 16px",
              backgroundColor: overwrite ? "#06d6a0" : "#333",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontWeight: overwrite ? "bold" : "normal",
            }}
          >
            {overwrite ? '✓ Overwrite' : 'Overwrite'}
          </button>
          
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "5px", marginBottom: "8px" }}>
            {overwrite ? 'Placing replaces existing objects' : 'Cannot place on occupied squares'}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.2)", marginTop: "10px", paddingTop: "10px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ffd166",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
          >
            Save Scene
          </button>
          
          <button
            onClick={handleLoad}
            style={{
              padding: "8px 16px",
              backgroundColor: "#118ab2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              marginTop: "8px",
            }}
          >
            Load Scene
          </button>
          
          <button
            onClick={handleClear}
            style={{
              padding: "8px 16px",
              backgroundColor: "#ef476f",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              width: "100%",
              marginTop: "8px",
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );
}

