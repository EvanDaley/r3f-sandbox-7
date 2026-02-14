import { Html } from "@react-three/drei";
import useRpgProgressionStore from "../stores/useRpgProgressionStore";

const panel = {
  width: 340,
  borderRadius: 12,
  background: "rgba(10, 12, 16, 0.84)",
  color: "#eef2ff",
  fontFamily: "Inter, system-ui, sans-serif",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  padding: "14px 16px",
  pointerEvents: "none",
};

const ProgressBar = ({ color, value }) => (
  <div style={{ width: "100%", height: 7, background: "rgba(255,255,255,0.16)", borderRadius: 999 }}>
    <div
      style={{
        width: `${value}%`,
        height: "100%",
        borderRadius: 999,
        background: color,
      }}
    />
  </div>
);

export default function ProgressionHud() {
  const skills = useRpgProgressionStore((state) => state.skills);
  const totalLevel = useRpgProgressionStore((state) => state.totalLevel);
  const totalXp = useRpgProgressionStore((state) => state.totalXp);
  const lastAction = useRpgProgressionStore((state) => state.lastAction);

  return (
    <Html fullscreen>
      <div style={{ position: "absolute", top: 16, left: 16, ...panel }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong>RPG Progression Demo</strong>
          <span>Lvl Σ {totalLevel}</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>Total XP: {Math.floor(totalXp)}</div>

        <div style={{ display: "grid", gap: 10 }}>
          {skills.map((skill) => (
            <div key={skill.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{skill.name}</span>
                <span>
                  Lv {skill.level} · {Math.floor(skill.xp)} XP
                </span>
              </div>
              <ProgressBar color={skill.color ?? "#7c3aed"} value={skill.progress.percentage} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, marginTop: 12, opacity: 0.78 }}>
          <div>WASD: Move and train Running</div>
          <div>Stand near a station + E: train station skill</div>
          <div>R: reset progression</div>
          <div style={{ marginTop: 8, color: "#c4b5fd" }}>{lastAction}</div>
        </div>
      </div>
    </Html>
  );
}
