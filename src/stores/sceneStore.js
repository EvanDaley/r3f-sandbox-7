import { lazy } from "react";
import { create } from "zustand";

const TutorialScene = lazy(() => import("../modules/tutorial/TutorialScene"));
const RpgScene = lazy(() => import("../modules/rpg/RpgScene"));
const ThirdPersonBlenderIntegrated = lazy(() => import("../modules/third_person_blender_integrated/ThirdPersonBlenderIntegrated"));
const ThirdPersonScene1 = lazy(() => import("../modules/third_person_scene_1/ThirdPersonScene1"));
const DarkScene = lazy(() => import("../modules/dark_scene/DarkScene"));
const ModelingSandbox1 = lazy(() => import("../modules/modeling_sandbox_1/ModelingSandbox1"));

const scenes = [
  { id: "modelingSandbox1", name: "Modeling Sandbox 1", scene: ModelingSandbox1 },
  { id: "dark", name: "Dark Realm", scene: DarkScene },
  { id: "tutorial", name: "Tutorial", scene: TutorialScene },
  { id: "rpg", name: "RPG Foundation", scene: RpgScene },
  { id: "thirdPersonBlenderIntegrated", name: "Third Person Blender Integrated", scene: ThirdPersonBlenderIntegrated },
  { id: "thirdPersonScene1", name: "Third Person Scene 1", scene: ThirdPersonScene1 },
];

let defaultScene = "modelingSandbox1";

const useSceneStore = create((set) => ({
  currentSceneId: defaultScene,
  scenes,
  setSceneId: (id) => set({ currentSceneId: id }),
}));

export default useSceneStore;
