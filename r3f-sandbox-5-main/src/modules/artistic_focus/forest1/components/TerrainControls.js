import React from 'react'
import useTerrainStore from '../stores/terrainStore'

export default function TerrainControls() {
  const {
    size,
    seed,
    octaves,
    persistence,
    lacunarity,
    setSize,
    setSeed,
    setOctaves,
    setPersistence,
    setLacunarity,
  } = useTerrainStore()

  const controlStyle = {
    marginBottom: '12px',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
  }

  const inputStyle = {
    width: '100%',
    padding: '4px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: 'white',
    outline: 'none',
  }

  const sliderStyle = {
    width: '100%',
    marginTop: '4px',
  }

  const valueStyle = {
    fontSize: '11px',
    opacity: 0.7,
    marginTop: '2px',
  }

  return (
    <div style={{
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: '16px',
      borderRadius: '8px',
      minWidth: '250px',
      maxWidth: '300px',
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '16px', 
        fontWeight: '600',
        color: 'white',
      }}>
        Terrain Generation
      </h3>

      <div style={controlStyle}>
        <label style={labelStyle}>Size: {size}</label>
        <input
          type="range"
          min="10"
          max="50"
          step="1"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle}>Seed: {seed}</label>
        <input
          type="range"
          min="0"
          max="1000"
          step="1"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle}>Octaves: {octaves}</label>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={octaves}
          onChange={(e) => setOctaves(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle}>Persistence: {persistence.toFixed(2)}</label>
        <input
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={persistence}
          onChange={(e) => setPersistence(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>

      <div style={controlStyle}>
        <label style={labelStyle}>Lacunarity: {lacunarity.toFixed(2)}</label>
        <input
          type="range"
          min="1.0"
          max="4.0"
          step="0.1"
          value={lacunarity}
          onChange={(e) => setLacunarity(Number(e.target.value))}
          style={sliderStyle}
        />
      </div>
    </div>
  )
}

