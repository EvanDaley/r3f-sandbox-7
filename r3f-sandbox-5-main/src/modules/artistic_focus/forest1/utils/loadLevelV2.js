import level1 from '../data/level1.json'

export function loadLevelV2(tileSize = 1) {
  // console.log('load level')
  return level1.map((tile) => ({
    ...tile,
      position: [tile.x * tileSize, -.24, tile.y * tileSize],
  }))
}

