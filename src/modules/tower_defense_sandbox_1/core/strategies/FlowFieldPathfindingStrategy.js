const HOME_CELL = { x: 0, z: 0 };

export default class FlowFieldPathfindingStrategy {
  constructor({ gridSize, cellSize }) {
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.halfGrid = Math.floor(gridSize / 2);
    this.distanceField = new Int16Array(gridSize * gridSize);
  }

  worldToCell(x, z) {
    return {
      x: Math.round(x / this.cellSize),
      z: Math.round(z / this.cellSize),
    };
  }

  cellToWorld(x, z) {
    return {
      x: x * this.cellSize,
      z: z * this.cellSize,
    };
  }

  inBounds(x, z) {
    return x >= -this.halfGrid && x <= this.halfGrid && z >= -this.halfGrid && z <= this.halfGrid;
  }

  toIndex(x, z) {
    return x + this.halfGrid + (z + this.halfGrid) * this.gridSize;
  }

  rebuildDistanceField(isWall) {
    this.distanceField.fill(-1);

    const queue = [HOME_CELL];
    this.distanceField[this.toIndex(HOME_CELL.x, HOME_CELL.z)] = 0;

    for (let head = 0; head < queue.length; head += 1) {
      const { x, z } = queue[head];
      const d = this.distanceField[this.toIndex(x, z)];
      const neighbors = [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 },
      ];

      for (const n of neighbors) {
        if (!this.inBounds(n.x, n.z) || isWall(n.x, n.z)) continue;
        const idx = this.toIndex(n.x, n.z);
        if (this.distanceField[idx] !== -1) continue;
        this.distanceField[idx] = d + 1;
        queue.push(n);
      }
    }
  }

  isReachableCell(cellX, cellZ) {
    if (!this.inBounds(cellX, cellZ)) return false;
    return this.distanceField[this.toIndex(cellX, cellZ)] !== -1;
  }

  getFlowDirection(position, outVec, isWall) {
    const cell = this.worldToCell(position.x, position.z);
    const currentDistance = this.inBounds(cell.x, cell.z) ? this.distanceField[this.toIndex(cell.x, cell.z)] : -1;

    if (currentDistance <= 0) {
      outVec.set(-position.x, 0, -position.z);
      return outVec.normalize();
    }

    let bestDistance = currentDistance;
    let bestCell = cell;
    const neighbors = [
      { x: cell.x + 1, z: cell.z },
      { x: cell.x - 1, z: cell.z },
      { x: cell.x, z: cell.z + 1 },
      { x: cell.x, z: cell.z - 1 },
    ];

    for (const n of neighbors) {
      if (!this.inBounds(n.x, n.z) || isWall(n.x, n.z)) continue;
      const dist = this.distanceField[this.toIndex(n.x, n.z)];
      if (dist !== -1 && dist < bestDistance) {
        bestDistance = dist;
        bestCell = n;
      }
    }

    const target = this.cellToWorld(bestCell.x, bestCell.z);
    outVec.set(target.x - position.x, 0, target.z - position.z);
    return outVec.normalize();
  }
}
