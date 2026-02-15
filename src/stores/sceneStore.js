import { create } from "zustand";
import ThirdPersonScene1 from "../modules/third_person_scene_1/ThirdPersonScene1";
import ThirdPersonBlenderIntegrated from "../modules/third_person_blender_integrated/ThirdPersonBlenderIntegrated";
import RpgScene from "../modules/rpg/RpgScene";
import WebRtcHtmlLab from "../modules/webrtc_html_lab/WebRtcHtmlLab";

const scenes = [
  { id: "webrtcHtmlLab", name: "WebRTC HTML Lab", scene: WebRtcHtmlLab },
  { id: "rpg", name: "RPG Foundation", scene: RpgScene },
  { id: "thirdPersonBlenderIntegrated", name: "Third Person Blender Integrated", scene: ThirdPersonBlenderIntegrated },
  { id: "thirdPersonScene1", name: "Third Person Scene 1", scene: ThirdPersonScene1 },
];

let defaultScene = "webrtcHtmlLab";

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
