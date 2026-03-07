import { useState } from 'react';
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
  resourceBar: {
    position: 'fixed',
    top: 12,
    right: 12,
    zIndex: 60,
    display: 'flex',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(13, 18, 30, 0.9)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
  },
  resourceItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#f8fafc',
    minWidth: 92,
  },
  resourceIcon: {
    width: 20,
    height: 20,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
    color: '#0f172a',
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
  const biomass = useTowerDefenseUiStore((state) => state.biomass);
  const energy = useTowerDefenseUiStore((state) => state.energy);
  const carbon = useTowerDefenseUiStore((state) => state.carbon);
  const uranium = useTowerDefenseUiStore((state) => state.uranium);
  const crystal = useTowerDefenseUiStore((state) => state.crystal);
  const buildSelection = useTowerDefenseUiStore((state) => state.buildSelection);
  const activeAmplifiers = useTowerDefenseUiStore((state) => state.activeAmplifiers);
  const setBuildSelection = useTowerDefenseUiStore((state) => state.setBuildSelection);
  const enemyTypes = useTowerDefenseUiStore((state) => state.enemyTypes);

  const resources = [
    { key: 'biomass', label: 'Biomass', value: biomass, icon: '🧬', color: '#22c55e' },
    { key: 'energy', label: 'Energy', value: energy, icon: '⚡', color: '#facc15' },
    { key: 'carbon', label: 'Carbon', value: carbon, icon: '⬛', color: '#9ca3af' },
    { key: 'uranium', label: 'Uranium', value: uranium, icon: '☢', color: '#84cc16' },
    { key: 'crystal', label: 'Crystal', value: crystal, icon: '💎', color: '#38bdf8' },
  ];

  return (
    <>
      <button type='button' style={panelStyles.launcher} onClick={() => setIsOpen((v) => !v)}>
        {isOpen ? 'Hide Tower Defense' : 'Open Tower Defense'}
      </button>

      <div style={panelStyles.resourceBar}>
        {resources.map((resource) => (
          <div key={resource.key} style={panelStyles.resourceItem} title={resource.label}>
            <span style={{ ...panelStyles.resourceIcon, background: resource.color }}>{resource.icon}</span>
            <span style={{ opacity: 0.9 }}>{resource.label}:</span>
            <strong>{resource.value}</strong>
          </div>
        ))}
      </div>

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
            <button type='button' onClick={() => window.dispatchEvent(new Event('td:force-wave'))}>
              Upgrade Beacon
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
            <button
              type='button'
              onClick={() => window.dispatchEvent(new Event('td:export-layout'))}
              style={{
                background: '#0ea5e9',
                color: '#fff',
              }}
            >
              Export Layout JSON
            </button>
          </div>

          <div style={{ padding: '10px 14px', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Enemy Types</div>
            {enemyTypes.map((type) => (
              <div key={type.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: type.color, display: 'inline-block' }} />
                <span>{type.label}</span>
                <span style={{ marginLeft: 'auto', opacity: 0.9 }}>SPD {type.baseSpeed} | HP {type.baseHealth} | BIO {type.biomassReward ?? 1}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 14px', fontSize: 11, opacity: 0.85 }}>
            <div>WASD: Move character</div>
            <div>Middle mouse: orbit camera</div>
            <div>Right click ground: place/remove selected build</div>
            <div>N: Upgrade beacon · K: Add skull</div>
            {activeAmplifiers.map((amp) => (
              <div key={amp.id}>☠ {amp.label}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
