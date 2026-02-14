// HTMLContent.js
import SceneSelect from './SceneSelect';
import useSceneStore from "../stores/sceneStore";
import usePeerConnection from "../modules/networking_focus/general_connection_tooling/hooks/usePeerConnection";

export default function HTMLContent() {
  const Overlay = useSceneStore(
    state => state.scenes.find(s => s.id === state.currentSceneId)?.overlay
  );

  const { isHost } = usePeerConnection();
  const isRunningLocally =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")

  // The scene switcher is just for local development or for debugging as "host" in prod.
  const showSceneSelect = isHost;

  return (
    <>
      {showSceneSelect && <SceneSelect />}
      {Overlay && <Overlay />}
    </>
  );
}
