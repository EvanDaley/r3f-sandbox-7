import { create } from "zustand";
import ThirdPersonScene1 from "../modules/third_person_scene_1/ThirdPersonScene1";
import ThirdPersonBlenderIntegrated from "../modules/third_person_blender_integrated/ThirdPersonBlenderIntegrated";
import Rpg2Scene from "../modules/rpg-2/Rpg2Scene";

const scenes = [
  { id: "rpg2", name: "RPG Foundation v2", scene: Rpg2Scene },
  { id: "thirdPersonBlenderIntegrated", name: "Third Person Blender Integrated", scene: ThirdPersonBlenderIntegrated },
  { id: "thirdPersonScene1", name: "Third Person Scene 1", scene: ThirdPersonScene1 },
];

let defaultScene = "rpg2";

// On the prod version, you can set a different default scene
// if (window.location.hostname !== "localhost") {
//   defaultScene = "thirdPersonScene1";
// }

const useSceneStore = create((set) => ({
  currentSceneId: defaultScene,
  scenes,
  setSceneId: (id) => set({ currentSceneId: id }),
}));

export default useSceneStore;
