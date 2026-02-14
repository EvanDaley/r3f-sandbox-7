import React, { useState, useEffect, useRef } from "react";
import ScreamingTextVariant from "./lowercase_html/ScreamingTextVariant";

export default function ScreamingTextOverlay() {
  const [text, setText] = useState("TEAM SYNERGY HAS BEEN ATTAINED");
  const [isFirstText, setIsFirstText] = useState(true);
  const audioRef = useRef(null);

  const SWITCH_TEXT_INTERVAL_MS = 3000;
  const FIRST_TEXT = "TEAM SYNERGY HAS BEEN ATTAINED";
  const SECOND_TEXT = "PLEASE RETURN TO WORK FEELING ENERGIZED";
  const AUDIO_URL = "https://public-r3f-sandbox-assets.s3.us-west-2.amazonaws.com/outro-hyro.mp3";
  
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

  // Text switching logic
  useEffect(() => {
    const timer = setInterval(() => {
      setIsFirstText((prev) => {
        const newIsFirst = !prev;
        setText(newIsFirst ? FIRST_TEXT : SECOND_TEXT);
        return newIsFirst;
      });
    }, SWITCH_TEXT_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <audio ref={audioRef} src={AUDIO_URL} loop />
      <ScreamingTextVariant text={text} />
    </>
  );
}
