import React from "react";

const styles = `

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }


  @keyframes scanline {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 0 100%;
    }
  }

  @keyframes fadeInFromBlack {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
    z-index: 0;
    overflow: hidden;
  }

  .image-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation: fadeInFromBlack 2s ease-in-out forwards;
  }

  .text {
    position: relative;
    font-size: clamp(56px, 14vw, 220px);
    font-weight: 900;
    font-family: 'Bebas Neue', 'Impact', 'Arial Black', sans-serif;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.1em;
    line-height: 0.9;
    padding: 0 20px;
    z-index: 1;
    
    /* Animated gradient background */
    background: linear-gradient(
      90deg,
      #ff0040 0%,
      #ff4400 25%,
      #ffaa00 50%,
      #ff4400 75%,
      #ff0040 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: 
      gradientShift 14s ease-in-out infinite,
      sciFiGlow 2s ease-in-out infinite,
      pulse 2.5s ease-in-out infinite;
    
    /* Fallback color for browsers that don't support background-clip */
    color: #ff4400;
    
    /* Scanline effect overlay */
    position: relative;
  }

  .text::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 0, 64, 0.03) 2px,
      rgba(255, 0, 64, 0.03) 4px
    );
    pointer-events: none;
    animation: scanline 8s linear infinite;
    z-index: 1;
  }

  .text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      #ff0040 0%,
      #ff4400 25%,
      #ffaa00 50%,
      #ff4400 75%,
      #ff0040 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 26s ease-in-out infinite;
    z-index: -1;
    filter: blur(8px);
    opacity: 0.6;
  }
`;

export default function BombGameTextVariant({ text }) {
  return (
    <>
      <style>{styles}</style>
      <div className="overlay">
        <img
          className="image-bg"
          src={`${process.env.PUBLIC_URL || ''}/images/backgrounds/bomb-game-A.png`}

          alt="Bomb Game Background"
        />
        <div className="text" data-text={text}>{text}</div>
      </div>
    </>
  );
}

