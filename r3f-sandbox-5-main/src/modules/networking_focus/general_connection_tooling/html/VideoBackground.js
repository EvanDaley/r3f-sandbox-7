import React, { useEffect, useState } from "react";

/**
 * VideoBackground
 *
 * Plays a looping background video that fades in smoothly from black.
 * Intended for full-screen background use.
 */
export default function VideoBackground({ src, fadeDuration = 1.8 }) {
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <video
        className={`display_video ${fadeIn ? "fade-in" : ""}`}
        preload="auto"
        src={src}
        autoPlay
        loop
        muted
        playsInline
      />

      <style>{`
        .display_video {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          opacity: 0;
          transition: opacity ${fadeDuration}s ease-in-out;
          z-index: -1;
          background-color: black;
        }
        .display_video.fade-in {
          opacity: 1;
        }
      `}</style>
    </>
  );
}
