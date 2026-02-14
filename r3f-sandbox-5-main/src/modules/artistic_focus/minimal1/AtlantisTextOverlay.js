const styles = `
  .container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    pointer-events: none;
  }

  .text {
    line-height: 1em;
    text-align: left;
    font-size: clamp(1em, 3vw, 3em);
    word-break: break-word;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-family: 'Inter', sans-serif;
  }
`

export default function AtlantisTextOverlay() {
  return (
    <>
      <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      <style>{styles}</style>
      <div className="container">
        <div className="text">
          "But afterwards there occurred violent earthquakes and floods; and in a single day and night of rain all your warlike men in a body sank into the earth,
          and the island of Atlantis in like manner disappeared, and was sunk beneath the sea."
        </div>
      </div>
    </>
  )
}
