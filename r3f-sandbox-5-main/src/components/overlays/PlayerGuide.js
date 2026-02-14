export default function PlayerGuide({
                                      lines = [
                                        // <>Use the <span style={{ color: "#ffd166" }}>Scene Switcher</span> to pick scenes.</>,
                                        // <>Use the <span style={{ color: "#06d6a0" }}>Palette Switcher</span> to try different colors.</>,
                                      ],
                                      placement = 'bottom'
                                    }) {
  if (!lines.length) return null

  const styles = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 200,
    color: "#fff",
    fontFamily: "sans-serif",
    fontSize: "20px",
    fontWeight: "600",
    background: "rgba(0, 0, 0, 0.6)",
    padding: "10px 20px",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
    textAlign: "center",
    pointerEvents: "none",
    lineHeight: "1.4",
  }

  if (placement === 'top') {
    styles.top = '70px'
  } else {
    styles.bottom = '30px'
  }

  return (
    <div
      style={styles}
    >
      {lines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  )
}
