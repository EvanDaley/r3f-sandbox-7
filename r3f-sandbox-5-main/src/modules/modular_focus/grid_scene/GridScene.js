import React from "react";
import * as THREE from "three";
import OrthoZoomOnly from "../../../components/controls/OrthoZoomOnly";
import SimpleLighting2 from "../../../components/environment/SimpleLighting2";
import EffectsV2 from "../../../components/effects/EffectsV2";
import { usePaletteStore } from "../../dynamic_colors/stores/paletteStore";
import { useGridSceneStore, gridToWorld } from "./stores/gridSceneStore";
import Desk1 from "../../dynamic_colors/objects/Desk1";
import Turret1 from "../../dynamic_colors/objects/Turret1";
import Wall from "./objects/Wall";
import Corner from "./objects/Corner";
import TJunction from "./objects/TJunction";
import FourWayJunction from "./objects/FourWayJunction";
import GridInteraction from "./components/GridInteraction";
import GridVisualization from "./components/GridVisualization";
import PlacementPreview from "./components/PlacementPreview";
import CopyPastePreview from "./components/CopyPastePreview";
import SelectionTool from "./components/SelectionTool";
import SelectionHighlight from "./components/SelectionHighlight";
import MoveTool from "./components/MoveTool";
import OrthoV2 from "../../../components/controls/OrthoV2";

export default function GridScene() {
  const activePalette = usePaletteStore((s) => s.activePalette);
  const objects = useGridSceneStore((s) => s.objects);
  const selectedObjectIds = useGridSceneStore((s) => s.selectedObjectIds);
  const moveMode = useGridSceneStore((s) => s.moveMode);
  const moveOffset = useGridSceneStore((s) => s.moveOffset);

  return (
    <>
      <color attach="background" args={["#3c2828"]} />
      {/* <OrthoZoomOnly /> */}
      <OrthoV2/>
      <SimpleLighting2 />
      <EffectsV2 />
      
      {/* Visual grid helper */}
      <GridVisualization size={50} showGrid={true} />
      
      {/* Placement preview - shows where object will be placed */}
      <PlacementPreview />
      
      {/* Copy/Paste preview - shows copied objects in ghost mode */}
      <CopyPastePreview />
      
      {/* Selection tool */}
      <SelectionTool />
      
      {/* Move tool */}
      <MoveTool />
      
      {/* Grid interaction layer for placing objects */}
      <GridInteraction />
      
      {/* Render all placed objects */}
      {Object.entries(objects).map(([id, obj]) => {
        // Apply move offset if this object is selected and in move mode
        const isSelected = selectedObjectIds.includes(id);
        const offsetX = (isSelected && moveMode) ? moveOffset.gridX : 0;
        const offsetZ = (isSelected && moveMode) ? moveOffset.gridZ : 0;
        const worldPos = gridToWorld(obj.gridX + offsetX, obj.gridZ + offsetZ);
        
        if (obj.type === 'desk') {
          return (
            <Desk1
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={[0, obj.rotation || 0, 0]}
            />
          );
        } else if (obj.type === 'turret') {
          return (
            <Turret1
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={[0, obj.rotation || 0, 0]}
            />
          );
        } else if (obj.type === 'wall') {
          return (
            <Wall
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={obj.rotation || 0}
            />
          );
        } else if (obj.type === 'corner') {
          return (
            <Corner
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={obj.rotation || 0}
            />
          );
        } else if (obj.type === 'tJunction') {
          return (
            <TJunction
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={obj.rotation || 0}
            />
          );
        } else if (obj.type === 'fourWayJunction') {
          return (
            <FourWayJunction
              key={id}
              materials={activePalette}
              position={[worldPos.x, worldPos.y, worldPos.z]}
              rotation={obj.rotation || 0}
            />
          );
        }
        return null;
      })}
      
      {/* Render selection highlights for all objects */}
      {Object.entries(objects).map(([id, obj]) => (
        <SelectionHighlight key={`highlight-${id}`} objectId={id} object={obj} />
      ))}
    </>
  );
}

