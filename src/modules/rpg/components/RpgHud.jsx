import useRpgProgressionStore from '../stores/useRpgProgressionStore';

const panel = {
  width: 360,
  color: '#f8fafc',
  background: 'rgba(13, 18, 30, 0.88)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  padding: '14px 16px',
  position: 'fixed',
  top: 16,
  right: 16,
  zIndex: 20,
  backdropFilter: 'blur(4px)',
  pointerEvents: 'none',
  boxSizing: 'border-box',
};

const ProgressBar = ({ color, value }) => (
  <div style={{ width: '100%', height: 7, background: 'rgba(255,255,255,0.16)', borderRadius: 999 }}>
    <div
      style={{
        width: `${value}%`,
        height: '100%',
        borderRadius: 999,
        background: color,
      }}
    />
  </div>
);

export default function RpgHud() {
  const skills = useRpgProgressionStore((state) => state.skills);
  const totalLevel = useRpgProgressionStore((state) => state.totalLevel);
  const totalXp = useRpgProgressionStore((state) => state.totalXp);
  const lastAction = useRpgProgressionStore((state) => state.lastAction);

  return (
    <div style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>RPG Foundation</strong>
        <span>Lvl Σ {totalLevel}</span>
      </div>
      <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 12 }}>Total XP: {Math.floor(totalXp)}</div>

      <div style={{ display: 'grid', gap: 10 }}>
        {skills.map((skill) => (
          <div key={skill.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span>{skill.name}</span>
              <span>
                Lv {skill.level} · {Math.floor(skill.xp)} XP
              </span>
            </div>
            <ProgressBar color={skill.color ?? '#7c3aed'} value={skill.progress.percentage} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, marginTop: 12, opacity: 0.78 }}>
        <div>WASD: Move and train Running</div>
        <div>E: Train nearest station skill</div>
        <div>R: Reset progression</div>
        <div>Hold middle-mouse: rotate camera</div>
        <div style={{ marginTop: 8, color: '#c4b5fd' }}>{lastAction}</div>
      </div>
    </div>
  );
}
