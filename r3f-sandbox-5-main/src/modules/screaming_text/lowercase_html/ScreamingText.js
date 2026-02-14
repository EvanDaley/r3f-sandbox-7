import React from "react";

const styles = `
  @keyframes flash {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(0.985); opacity: 0.97; }
  }

  @keyframes bgPulse {
    0%, 100% { background-position: 0 0; }
    50% { background-position: 40px 40px; }
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at center, #090b15 0%, #000 90%);
    background-image: repeating-linear-gradient(
      to right,
      rgba(255,255,255,0.04) 0 1px,
      transparent 1px 80px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(255,255,255,0.04) 0 1px,
      transparent 1px 80px
    );
    animation: bgPulse 12s linear infinite;
    z-index: 1000;
  }

  .text {
    font-size: clamp(56px, 14vw, 220px);
    font-weight: 900;
    font-family: 'Bebas Neue', 'Impact', 'Arial Black', sans-serif;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.05em;
    line-height: 0.9;
    padding: 0 20px;
    background: linear-gradient(90deg, #aaffff 0%, #ffffff 40%, #00eaff 80%, #aaffff 100%);
    background-size: 200% auto;
    color: #ffffff; /* solid fallback */
    animation: flash 2.2s ease-in-out infinite;
    -webkit-background-clip: none;
    text-shadow:
      0 0 4px #00faff,
      0 0 8px #00faff,
      2px 2px 0 #000;
  }
`;

export default function ScreamingText({ text }) {
  return (
    <>
      <style>{styles}</style>
      <div className="overlay">
        <div className="text">{text}</div>
      </div>
    </>
  );
}

