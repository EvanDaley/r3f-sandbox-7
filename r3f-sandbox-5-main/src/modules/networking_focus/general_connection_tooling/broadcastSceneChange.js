import { broadcastMessage } from "./broadcastMessage";

export const broadcastSceneChange = (sceneId) => {
  broadcastMessage(
    {
      scene: "common",
      type: "changeScene",
      payload: { sceneId },
    },
    { hostOnly: true }
  );
};
