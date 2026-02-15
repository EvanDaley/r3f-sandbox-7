import { create } from "zustand";
import ThirdPersonScene1 from "../modules/third_person_scene_1/ThirdPersonScene1";
import ThirdPersonBlenderIntegrated from "../modules/third_person_blender_integrated/ThirdPersonBlenderIntegrated";
import RpgScene from "../modules/rpg/RpgScene";
import TutorialScene from "../modules/tutorial/TutorialScene";

const scenes = [
  { id: "tutorial", name: "Tutorial", scene: TutorialScene },
  { id: "rpg", name: "RPG Foundation", scene: RpgScene },
  { id: "thirdPersonBlenderIntegrated", name: "Third Person Blender Integrated", scene: ThirdPersonBlenderIntegrated },
  { id: "thirdPersonScene1", name: "Third Person Scene 1", scene: ThirdPersonScene1 },
];

let defaultScene = "tutorial";

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
