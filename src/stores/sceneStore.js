import { lazy } from "react";
import { create } from "zustand";

const TutorialScene = lazy(() => import("../modules/tutorial/TutorialScene"));
const RpgScene = lazy(() => import("../modules/rpg/RpgScene"));
const ThirdPersonBlenderIntegrated = lazy(() => import("../modules/third_person_blender_integrated/ThirdPersonBlenderIntegrated"));
const ThirdPersonScene1 = lazy(() => import("../modules/third_person_scene_1/ThirdPersonScene1"));
const DarkScene = lazy(() => import("../modules/dark_scene/DarkScene"));
const DarkTower = lazy(() => import("../modules/dark_tower/DarkTower"));
const ModelingSandbox1 = lazy(() => import("../modules/modeling_sandbox_1/ModelingSandbox1"));
const TowerDefenseSandbox1 = lazy(() => import("../modules/tower_defense_sandbox_1/TowerDefenseSandbox1"));
const GreatExpanse = lazy(() => import("../modules/great_expanse/GreatExpanse"));
const CosmicAetherScene = lazy(() => import("../modules/cosmic_aether/CosmicAetherScene"));
const CsgHouseScene = lazy(() => import("../modules/csg_sandbox/CsgHouseScene"));
const EmptyScene = lazy(() => import("../modules/empty_scene/EmptyScene"));
const Objects1Scene = lazy(() =>
  import("../modules/objects_1").catch((err) => {
    console.error("1_objects scene load failed:", err);
    throw err;
  })
);

const scenes = [
  { id: "towerDefenseSandbox1", name: "Tower Defense Sandbox 1", scene: TowerDefenseSandbox1 },
  { id: "modelingSandbox1", name: "Modeling Sandbox 1", scene: ModelingSandbox1 },
  { id: "dark", name: "Dark Realm", scene: DarkScene },
  { id: "darkTower", name: "Dark Tower", scene: DarkTower },
  { id: "tutorial", name: "Tutorial", scene: TutorialScene },
  { id: "rpg", name: "RPG Foundation", scene: RpgScene },
  { id: "thirdPersonBlenderIntegrated", name: "Third Person Blender Integrated", scene: ThirdPersonBlenderIntegrated },
  { id: "thirdPersonScene1", name: "Third Person Scene 1", scene: ThirdPersonScene1 },
  { id: "greatExpanse", name: "Great Expanse", scene: GreatExpanse },
  { id: "cosmicAether", name: "Cosmic Aether", scene: CosmicAetherScene },
  { id: "csgSandbox", name: "CSG House Sandbox", scene: CsgHouseScene },
  { id: "emptyScene", name: "Empty Scene", scene: EmptyScene },
  { id: "1_objects", name: "Ragdoll Objects 1", scene: Objects1Scene },
];

let defaultScene = "1_objects";

const useSceneStore = create((set) => ({
  currentSceneId: defaultScene,
  scenes,
  setSceneId: (id) => set({ currentSceneId: id }),
}));

export default useSceneStore;
