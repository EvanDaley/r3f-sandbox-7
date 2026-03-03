import { useMemo, useState } from 'react';
import useTowerDefenseUiStore from '../stores/useTowerDefenseUiStore';

const panelStyles = {
  launcher: {
    position: 'fixed',
    left: 12,
    top: 12,
    zIndex: 56,
    border: '1px solid rgba(255,255,255,0.24)',
    borderRadius: 999,
    background: 'linear-gradient(135deg, rgba(14,116,144,0.9), rgba(2,132,199,0.75))',
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
    top: 62,
    width: 360,
    zIndex: 56,
    backdropFilter: 'blur(10px)',
    boxSizing: 'border-box',
    boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
    overflow: 'hidden',
  },
};

export default function TowerDefenseHud() {
  const [isOpen, setIsOpen] = useState(true);
  const waveNumber = useTowerDefenseUiStore((state) => state.waveNumber);
  const activeEnemies = useTowerDefenseUiStore((state) => state.activeEnemies);
  const maxEnemies = useTowerDefenseUiStore((state) => state.maxEnemies);
  const pendingSpawns = useTowerDefenseUiStore((state) => state.pendingSpawns);
  const wallCount = useTowerDefenseUiStore((state) => state.wallCount);
  const amplifierCount = useTowerDefenseUiStore((state) => state.amplifierCount);
  const turretCount = useTowerDefenseUiStore((state) => state.turretCount);
  const buildSelection = useTowerDefenseUiStore((state) => state.buildSelection);
  const activeAmplifiers = useTowerDefenseUiStore((state) => state.activeAmplifiers);
  const setBuildSelection = useTowerDefenseUiStore((state) => state.setBuildSelection);
  const enemyTypes = useTowerDefenseUiStore((state) => state.enemyTypes);

  const canForceWave = useMemo(() => maxEnemies > 0, [maxEnemies]);

  return (
    <>
      <button type='button' style={panelStyles.launcher} onClick={() => setIsOpen((v) => !v)}>
        {isOpen ? 'Hide Tower Defense' : 'Open Tower Defense'}
      </button>


      <div
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
        }}
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 16,
          transform: 'translateX(-50%)',
          zIndex: 58,
          display: 'flex',
          gap: 8,
          padding: 8,
          borderRadius: 10,
          background: 'rgba(13, 18, 30, 0.92)',
          border: '1px solid rgba(255,255,255,0.18)',
        }}
      >
        <button
          type='button'
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setBuildSelection('wall');
          }}
          style={{
            minWidth: 92,
            background: buildSelection === 'wall' ? '#475569' : '#1f2937',
            color: '#fff',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Build: Wall
        </button>
        <button
          type='button'
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setBuildSelection('turret');
          }}
          style={{
            minWidth: 92,
            background: buildSelection === 'turret' ? '#1d4ed8' : '#1f2937',
            color: '#fff',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Build: Turret
        </button>
      </div>

      {isOpen && (
        <div style={panelStyles.panel}>
          <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.12)', fontWeight: 700 }}>
            Tower Defense Sandbox 1
          </div>

          <div style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div>Wave: {waveNumber}</div>
            <div>Active enemies: {activeEnemies} / {maxEnemies}</div>
            <div>Queued spawns: {pendingSpawns}</div>
            <div>Amplifiers: {amplifierCount}</div>
            <div>Walls: {wallCount}</div>
            <div>Turrets: {turretCount}</div>
            <div>Build mode: {buildSelection}</div>
          </div>

          <div style={{ padding: '10px 14px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button type='button' disabled={!canForceWave} onClick={() => window.dispatchEvent(new Event('td:force-wave'))}>
              Force Wave
            </button>
            <button type='button' onClick={() => window.dispatchEvent(new Event('td:add-amplifier'))}>
              Add Skull
            </button>
            <button 
              type='button' 
              onClick={() => window.dispatchEvent(new Event('td:clear-all'))}
              style={{
                background: '#dc2626',
                color: '#fff',
              }}
            >
              Clear All
            </button>
            <button 
              type='button' 
              onClick={() => window.dispatchEvent(new Event('td:clear-turrets'))}
              style={{
                background: '#ea580c',
                color: '#fff',
              }}
            >
              Clear Turrets
            </button>
          </div>

          <div style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Enemy Types</div>
            {enemyTypes.map((type) => (
              <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: type.color, display: 'inline-block' }} />
                <span>{type.label}</span>
                <span style={{ marginLeft: 'auto', opacity: 0.9 }}>SPD {type.baseSpeed} | HP {type.baseHealth}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 14px', fontSize: 11, opacity: 0.85 }}>
            <div>WASD: Move character</div>
            <div>Middle mouse: orbit camera</div>
            <div>Right click ground: place/remove selected build</div>
            <div>N: Force wave · K: Add skull</div>
            {activeAmplifiers.map((amp) => (
              <div key={amp.id}>☠ {amp.label}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
