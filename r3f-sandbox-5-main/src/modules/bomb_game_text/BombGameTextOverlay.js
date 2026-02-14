import React, { useEffect, useRef } from "react";
import BombGameTextVariant from "./lowercase_html/BombGameTextVariant";

export default function BombGameTextOverlay() {
  const audioRef = useRef(null);

  const AUDIO_URL = "https://public-r3f-sandbox-assets.s3.us-west-2.amazonaws.com/orchestra2.mp3";
  
  // Play audio when component mounts
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Wait for audio to be ready, then try to play
    const playAudio = async () => {
      try {
        // Set volume to avoid sudden loud playback
        audio.volume = 1;
        await audio.play();
      } catch (error) {
        // Autoplay was blocked - this is normal on fresh page loads
        // Try to play on first user interaction
        const handleFirstInteraction = async () => {
          try {
            await audio.play();
          } catch (e) {
            console.log("Audio playback failed:", e);
          }
          document.removeEventListener("click", handleFirstInteraction);
          document.removeEventListener("keydown", handleFirstInteraction);
          document.removeEventListener("touchstart", handleFirstInteraction);
        };
        
        document.addEventListener("click", handleFirstInteraction, { once: true });
        document.addEventListener("keydown", handleFirstInteraction, { once: true });
        document.addEventListener("touchstart", handleFirstInteraction, { once: true });
      }
    };

    // Wait for audio metadata to load
    if (audio.readyState >= 2) {
      // Audio is already loaded
      playAudio();
    } else {
      // Wait for audio to load
      audio.addEventListener("loadeddata", playAudio, { once: true });
    }

    // Cleanup: pause and reset audio when component unmounts
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.removeEventListener("loadeddata", playAudio);
      }
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} loop />
      <BombGameTextVariant text="BOMB GAME" />
    </>
  );
}

