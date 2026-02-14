import { HexColorPicker } from "react-colorful"
import { useSnapshot } from "valtio"
import { state } from "./ItemConfigurator1"

export default function ItemConfigurator1Overlay() {
  const snap = useSnapshot(state)
  
  return (
    <div style={{ 
      display: snap.current ? "block" : "none",
      position: "absolute",
      top: "20%",
      right: "10%",
      transform: "none",
      zIndex: 100,
      textAlign: "center"
    }}>
      <HexColorPicker 
        className="picker" 
        color={snap.items[snap.current]} 
        onChange={(color) => (state.items[snap.current] = color)} 
      />
      <h1 style={{ color: "#fff", marginTop: "20px" }}>{snap.current}</h1>
    </div>
  )
}

