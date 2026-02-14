import React from "react";
import usePeerConnection from "../general_connection_tooling/hooks/usePeerConnection";
import MyPeerId from "../general_connection_tooling/html/MyPeerId";
import WelcomeModal from "../general_connection_tooling/html/WelcomeModal";
import VideoBackground from "../general_connection_tooling/html/VideoBackground";

export default function ConnectPageOverlay() {
  const {
    peerId,
  } = usePeerConnection();

  return (
    <>
      <MyPeerId>{peerId || "Loading..."}</MyPeerId>
      <WelcomeModal/>
      <VideoBackground
        // TODO: Pick another video
        src="https://bq3ql70ihiy3zndw.public.blob.vercel-storage.com/sky-SfQrkktlnS4DFjvk51B4f1Mopjh1S3.mp4"
      />
    </>
  );
}
