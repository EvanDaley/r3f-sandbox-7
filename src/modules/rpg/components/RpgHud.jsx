import { useMemo, useState } from 'react';
import useRpgProgressionStore from '../stores/useRpgProgressionStore';

const MIN_WIDTH = 280;
const MAX_WIDTH = 520;
const MIN_HEIGHT = 260;
const MAX_HEIGHT = 720;

const styles = {
  launcher: {
    position: 'fixed',
    left: 12,
    bottom: 64,
    zIndex: 56,
    border: '1px solid rgba(255,255,255,0.24)',
    borderRadius: 999,
    background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(79,70,229,0.75))',
    boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    padding: '9px 12px',
    cursor: 'pointer',
    backdropFilter: 'blur(6px)',
  },
  panel: {
    color: '#f8fafc',
    background: 'rgba(13, 18, 30, 0.9)',
    borderRadius: 14,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    position: 'fixed',
    left: 12,
    bottom: 114,
    zIndex: 56,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: 'auto auto 1fr auto',
  },
  resizeHandle: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '24px',
    height: '24px',
    cursor: 'nesw-resize',
    zIndex: 100,
    background: 'rgba(255,255,255,0.2)',
    borderTopRightRadius: 14,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: '4px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px 8px',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  totals: {
    fontSize: 12,
    opacity: 0.8,
    padding: '8px 14px 10px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  skillsList: {
    display: 'grid',
    gap: 10,
    padding: '12px 14px',
    alignContent: 'start',
    overflowY: 'auto',
  },
  footer: {
    fontSize: 11,
    opacity: 0.78,
    padding: '10px 14px 16px 34px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(0,0,0,0.2)',
  },
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

  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState({ width: 360, height: 380 });

  const panelStyle = useMemo(
    () => ({
      ...styles.panel,
      width: `${size.width}px`,
      height: `${size.height}px`,
    }),
    [size.height, size.width]
  );

  const startResize = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = size.width;
    const startHeight = size.height;

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      setSize({
        width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth - deltaX)),
        height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startHeight - deltaY)),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <>
      <button type="button" style={styles.launcher} onClick={() => setIsOpen((current) => !current)}>
        {isOpen ? 'Hide Skills' : 'Open Skills'}
      </button>

      {isOpen && (
        <div style={panelStyle}>
          <button
            type="button"
            aria-label="Resize skills panel"
            style={styles.resizeHandle}
            onMouseDown={startResize}
          >
            ◢
          </button>

          <div style={styles.header}>
            <strong>RPG Foundation</strong>
            <span>Lvl Σ {totalLevel}</span>
          </div>

          <div style={styles.totals}>Total XP: {Math.floor(totalXp)}</div>

          <div style={styles.skillsList}>
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

          <div style={styles.footer}>
            <div>WASD: Move and train Running</div>
            <div>E: Train nearest station skill</div>
            <div>R: Reset progression</div>
            <div>Hold middle-mouse: rotate camera</div>
            <div style={{ marginTop: 8, color: '#c4b5fd' }}>{lastAction}</div>
          </div>
        </div>
      )}
    </>
  );
}
