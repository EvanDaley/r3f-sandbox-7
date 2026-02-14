import React from "react";

const styles = `
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

  .video-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .text {
    position: relative;
    font-size: clamp(56px, 14vw, 220px);
    font-weight: 900;
    font-family: 'Bebas Neue', 'Impact', 'Arial Black', sans-serif;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 0.05em;
    line-height: 0.9;
    padding: 0 20px;
    color: white;
    z-index: 1;
  }
`;

export default function ScreamingTextVariant({ text }) {
  return (
    <>
      <style>{styles}</style>
      <div className="overlay">
        <video
          className="video-bg"
          src="https://bq3ql70ihiy3zndw.public.blob.vercel-storage.com/sky-SfQrkktlnS4DFjvk51B4f1Mopjh1S3.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="text">{text}</div>
      </div>
    </>
  );
}
