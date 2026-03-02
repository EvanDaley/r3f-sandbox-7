import * as THREE from 'three';

const HOME_CELL = { x: 0, z: 0 };

export default class TowerDefenseEngine {
  constructor({
    gridSize = 25,
    cellSize = 2,
    maxEnemies = 20,
    waveSize = 20,
    waveInterval = 14,
    spawnCadence = 0.15,
  } = {}) {
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.maxEnemies = maxEnemies;
    this.waveSize = waveSize;
    this.waveInterval = waveInterval;
    this.spawnCadence = spawnCadence;

    this.halfGrid = Math.floor(gridSize / 2);
    this.walls = new Set();
    this.distanceField = new Int16Array(gridSize * gridSize);

    this.pendingSpawns = [];
    this.lastWaveTime = -waveInterval;

    this.enemies = Array.from({ length: maxEnemies }, (_, id) => ({
      id,
      active: false,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      speed: 3 + Math.random() * 0.6,
    }));

    this.tempVecA = new THREE.Vector3();
    this.tempVecB = new THREE.Vector3();
    this.tempVecC = new THREE.Vector3();

    this.rebuildFlowField();
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
    return (x + this.halfGrid) + (z + this.halfGrid) * this.gridSize;
  }

  toggleWall(cellX, cellZ) {
    if (!this.inBounds(cellX, cellZ)) return;
    if (cellX === HOME_CELL.x && cellZ === HOME_CELL.z) return;

    const key = `${cellX},${cellZ}`;
    if (this.walls.has(key)) {
      this.walls.delete(key);
    } else {
      this.walls.add(key);
    }
    this.rebuildFlowField();
  }

  isWall(cellX, cellZ) {
    return this.walls.has(`${cellX},${cellZ}`);
  }

  rebuildFlowField() {
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
        if (!this.inBounds(n.x, n.z) || this.isWall(n.x, n.z)) continue;
        const idx = this.toIndex(n.x, n.z);
        if (this.distanceField[idx] !== -1) continue;
        this.distanceField[idx] = d + 1;
        queue.push(n);
      }
    }
  }

  enqueueWave(currentTime) {
    this.lastWaveTime = currentTime;
    for (let i = 0; i < this.waveSize; i += 1) {
      this.pendingSpawns.push(currentTime + i * this.spawnCadence);
    }
  }

  randomSpawnCell() {
    const edge = Math.floor(Math.random() * 4);
    const offset = Math.floor(Math.random() * this.gridSize) - this.halfGrid;
    if (edge === 0) return { x: -this.halfGrid, z: offset };
    if (edge === 1) return { x: this.halfGrid, z: offset };
    if (edge === 2) return { x: offset, z: -this.halfGrid };
    return { x: offset, z: this.halfGrid };
  }

  activateEnemy(enemy) {
    for (let attempts = 0; attempts < 40; attempts += 1) {
      const cell = this.randomSpawnCell();
      if (this.isWall(cell.x, cell.z)) continue;
      if (this.distanceField[this.toIndex(cell.x, cell.z)] === -1) continue;
      const world = this.cellToWorld(cell.x, cell.z);
      enemy.position.set(world.x, 0.55, world.z);
      enemy.velocity.set(0, 0, 0);
      enemy.active = true;
      return;
    }
  }

  flushSpawns(currentTime) {
    while (this.pendingSpawns.length && this.pendingSpawns[0] <= currentTime) {
      this.pendingSpawns.shift();
      const enemy = this.enemies.find((item) => !item.active);
      if (enemy) this.activateEnemy(enemy);
    }
  }

  flowDirection(position, outVec) {
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
      if (!this.inBounds(n.x, n.z) || this.isWall(n.x, n.z)) continue;
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

  update(deltaTime, elapsedTime) {
    if (elapsedTime - this.lastWaveTime >= this.waveInterval) {
      this.enqueueWave(elapsedTime);
    }

    this.flushSpawns(elapsedTime);

    const neighborRadiusSq = 3.2 * 3.2;
    const separationRadiusSq = 1.25 * 1.25;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const toHome = this.tempVecA.set(-enemy.position.x, 0, -enemy.position.z);
      if (toHome.lengthSq() < 0.7 * 0.7) {
        enemy.active = false;
        continue;
      }

      const flow = this.flowDirection(enemy.position, this.tempVecB).multiplyScalar(1.6);

      let alignX = 0;
      let alignZ = 0;
      let cohX = 0;
      let cohZ = 0;
      let sepX = 0;
      let sepZ = 0;
      let neighborCount = 0;

      for (const other of this.enemies) {
        if (other === enemy || !other.active) continue;

        const dx = enemy.position.x - other.position.x;
        const dz = enemy.position.z - other.position.z;
        const distSq = dx * dx + dz * dz;
        if (distSq > neighborRadiusSq) continue;

        neighborCount += 1;
        alignX += other.velocity.x;
        alignZ += other.velocity.z;
        cohX += other.position.x;
        cohZ += other.position.z;

        if (distSq < separationRadiusSq && distSq > 0.0001) {
          const inv = 1 / distSq;
          sepX += dx * inv;
          sepZ += dz * inv;
        }
      }

      const steer = this.tempVecC.copy(flow);

      if (neighborCount > 0) {
        const invCount = 1 / neighborCount;

        this.tempVecA.set(alignX * invCount, 0, alignZ * invCount).normalize().multiplyScalar(0.5);
        steer.add(this.tempVecA);

        this.tempVecA.set(cohX * invCount - enemy.position.x, 0, cohZ * invCount - enemy.position.z)
          .normalize()
          .multiplyScalar(0.45);
        steer.add(this.tempVecA);

        this.tempVecA.set(sepX, 0, sepZ).normalize().multiplyScalar(0.9);
        steer.add(this.tempVecA);
      }

      enemy.velocity.lerp(steer.normalize().multiplyScalar(enemy.speed), Math.min(1, deltaTime * 3.5));
      enemy.position.addScaledVector(enemy.velocity, deltaTime);
      enemy.position.y = 0.55;
    }
  }
}
