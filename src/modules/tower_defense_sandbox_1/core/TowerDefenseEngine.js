import * as THREE from 'three';
import FlockingSteeringStrategy from './strategies/FlockingSteeringStrategy';
import FlowFieldPathfindingStrategy from './strategies/FlowFieldPathfindingStrategy';

const HOME_CELL = { x: 0, z: 0 };

const ENEMY_TYPES = [
  {
    id: 'runner',
    label: 'Runner Drone',
    color: '#ef4444',
    size: 0.75,
    baseSpeed: 3.8,
    baseHealth: 55,
    weight: 5,
  },
  {
    id: 'tank',
    label: 'Bulwark Cube',
    color: '#f59e0b',
    size: 1.15,
    baseSpeed: 2.2,
    baseHealth: 140,
    weight: 2,
  },
  {
    id: 'striker',
    label: 'Striker Prism',
    color: '#8b5cf6',
    size: 0.9,
    baseSpeed: 3.1,
    baseHealth: 85,
    weight: 3,
  },
];

const AMPLIFIERS = [
  {
    id: 'iron-skin',
    label: 'Iron Skin Skull',
    description: 'Enemies have tougher armor.',
    healthMultiplier: 1.35,
  },
  {
    id: 'haste',
    label: 'Haste Skull',
    description: 'Enemies move faster.',
    speedMultiplier: 1.2,
  },
  {
    id: 'swarm',
    label: 'Swarm Skull',
    description: 'Each wave has extra enemies.',
    waveSizeMultiplier: 1.35,
  },
  {
    id: 'frenzy',
    label: 'Frenzy Skull',
    description: 'Waves spawn more rapidly.',
    spawnCadenceMultiplier: 0.75,
  },
];

export default class TowerDefenseEngine {
  constructor({
    gridSize = 25,
    cellSize = 2,
    maxEnemies = 40,
    waveSize = 20,
    waveInterval = 14,
    spawnCadence = 0.15,
  } = {}) {
    this.gridSize = gridSize;
    this.cellSize = cellSize;
    this.maxEnemies = maxEnemies;
    this.baseWaveSize = waveSize;
    this.waveInterval = waveInterval;
    this.baseSpawnCadence = spawnCadence;

    this.enemyTypes = ENEMY_TYPES;
    this.amplifierPool = AMPLIFIERS;
    this.activeAmplifierIds = [];
    this.waveNumber = 0;

    this.halfGrid = Math.floor(gridSize / 2);
    this.walls = new Set();
    this.turrets = new Set();
    this.projectiles = [];

    this.pathfindingStrategy = new FlowFieldPathfindingStrategy({
      gridSize: this.gridSize,
      cellSize: this.cellSize,
    });

    this.steeringStrategy = new FlockingSteeringStrategy();

    this.pendingSpawns = [];
    this.lastWaveTime = -waveInterval;
    this.nextTurretFireTime = 0;

    this.enemies = Array.from({ length: maxEnemies }, (_, id) => ({
      id,
      active: false,
      typeIndex: 0,
      size: 1,
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      speed: 2.5,
      maxHealth: 100,
      health: 100,
    }));

    this.tempVecA = new THREE.Vector3();
    this.tempVecB = new THREE.Vector3();
    this.tempVecC = new THREE.Vector3();

    this.rebuildFlowField();
  }

  get activeAmplifiers() {
    return this.activeAmplifierIds
      .map((id) => this.amplifierPool.find((amp) => amp.id === id))
      .filter(Boolean);
  }

  getAmplifierMultipliers() {
    const multipliers = {
      healthMultiplier: 1,
      speedMultiplier: 1,
      waveSizeMultiplier: 1,
      spawnCadenceMultiplier: 1,
    };

    for (const amp of this.activeAmplifiers) {
      multipliers.healthMultiplier *= amp.healthMultiplier ?? 1;
      multipliers.speedMultiplier *= amp.speedMultiplier ?? 1;
      multipliers.waveSizeMultiplier *= amp.waveSizeMultiplier ?? 1;
      multipliers.spawnCadenceMultiplier *= amp.spawnCadenceMultiplier ?? 1;
    }

    return multipliers;
  }

  forceAddAmplifier() {
    const inactive = this.amplifierPool.filter((amp) => !this.activeAmplifierIds.includes(amp.id));
    if (!inactive.length) return null;

    const selected = inactive[Math.floor(Math.random() * inactive.length)];
    this.activeAmplifierIds.push(selected.id);
    return selected;
  }

  maybeUnlockAmplifier() {
    if (this.waveNumber > 1 && this.waveNumber % 2 === 0) {
      this.forceAddAmplifier();
    }
  }

  worldToCell(x, z) {
    return this.pathfindingStrategy.worldToCell(x, z);
  }

  cellToWorld(x, z) {
    return this.pathfindingStrategy.cellToWorld(x, z);
  }

  inBounds(x, z) {
    return this.pathfindingStrategy.inBounds(x, z);
  }


  toggleWall(cellX, cellZ) {
    if (!this.inBounds(cellX, cellZ)) return;
    if (cellX === HOME_CELL.x && cellZ === HOME_CELL.z) return;

    const key = `${cellX},${cellZ}`;
    if (this.turrets.has(key)) return;

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

  toggleTurret(cellX, cellZ) {
    if (!this.inBounds(cellX, cellZ)) return;
    if (cellX === HOME_CELL.x && cellZ === HOME_CELL.z) return;

    const key = `${cellX},${cellZ}`;
    if (this.walls.has(key)) return;

    if (this.turrets.has(key)) {
      this.turrets.delete(key);
    } else {
      this.turrets.add(key);
    }
  }

  setWalls(wallKeys = []) {
    this.walls = new Set(
      wallKeys.filter((key) => {
        const [x, z] = key.split(',').map(Number);
        if (!this.inBounds(x, z)) return false;
        if (x === HOME_CELL.x && z === HOME_CELL.z) return false;
        return true;
      })
    );

    this.rebuildFlowField();
  }

  getNearestEnemy(position, range) {
    let nearest = null;
    let bestDistSq = range * range;
    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const distSq = enemy.position.distanceToSquared(position);
      if (distSq < bestDistSq) {
        bestDistSq = distSq;
        nearest = enemy;
      }
    }

    return nearest;
  }

  updateTurrets(deltaTime, elapsedTime) {
    if (!this.turrets.size) return;

    if (!this.nextTurretFireTime || elapsedTime >= this.nextTurretFireTime) {
      const fireRate = 0.45;
      this.nextTurretFireTime = elapsedTime + fireRate;

      for (const key of this.turrets) {
        const [x, z] = key.split(',').map(Number);
        const world = this.cellToWorld(x, z);
        const turretPos = this.tempVecA.set(world.x, 0.9, world.z);
        const target = this.getNearestEnemy(turretPos, 7.5);
        if (!target) continue;

        const direction = this.tempVecB.copy(target.position).sub(turretPos).normalize();
        this.projectiles.push({
          position: new THREE.Vector3(turretPos.x, turretPos.y, turretPos.z),
          velocity: direction.multiplyScalar(12).clone(),
          ttl: 1.25,
          damage: 28,
        });
      }
    }

    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.projectiles[i];
      projectile.position.addScaledVector(projectile.velocity, deltaTime);
      projectile.ttl -= deltaTime;

      let hitEnemy = null;
      for (const enemy of this.enemies) {
        if (!enemy.active) continue;
        const hitRadius = enemy.size * 0.55;
        if (projectile.position.distanceToSquared(enemy.position) <= hitRadius * hitRadius) {
          hitEnemy = enemy;
          break;
        }
      }

      if (hitEnemy) {
        hitEnemy.health -= projectile.damage;
        if (hitEnemy.health <= 0) {
          hitEnemy.active = false;
        }
        this.projectiles.splice(i, 1);
        continue;
      }

      if (projectile.ttl <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  rebuildFlowField() {
    this.pathfindingStrategy.rebuildDistanceField((x, z) => this.isWall(x, z));
  }

  pickEnemyType() {
    const waveBonus = this.waveNumber >= 4 ? 1 : 0;
    const dynamicWeights = this.enemyTypes.map((type, index) => {
      if (type.id === 'tank') return type.weight + waveBonus;
      if (type.id === 'striker') return type.weight + Math.floor(this.waveNumber / 3);
      return type.weight;
    });

    const totalWeight = dynamicWeights.reduce((sum, value) => sum + value, 0);
    let roll = Math.random() * totalWeight;
    for (let i = 0; i < dynamicWeights.length; i += 1) {
      roll -= dynamicWeights[i];
      if (roll <= 0) return i;
    }

    return 0;
  }

  enqueueWave(currentTime) {
    this.waveNumber += 1;
    this.lastWaveTime = currentTime;
    this.maybeUnlockAmplifier();

    const multipliers = this.getAmplifierMultipliers();
    const waveSize = Math.round(this.baseWaveSize * multipliers.waveSizeMultiplier);
    const cadence = this.baseSpawnCadence * multipliers.spawnCadenceMultiplier;

    for (let i = 0; i < waveSize; i += 1) {
      this.pendingSpawns.push({
        spawnAt: currentTime + i * cadence,
        typeIndex: this.pickEnemyType(),
      });
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

  activateEnemy(enemy, typeIndex) {
    const type = this.enemyTypes[typeIndex] ?? this.enemyTypes[0];
    const multipliers = this.getAmplifierMultipliers();

    for (let attempts = 0; attempts < 40; attempts += 1) {
      const cell = this.randomSpawnCell();
      if (this.isWall(cell.x, cell.z)) continue;
      if (!this.pathfindingStrategy.isReachableCell(cell.x, cell.z)) continue;
      const world = this.cellToWorld(cell.x, cell.z);

      enemy.position.set(world.x, 0.55, world.z);
      enemy.velocity.set(0, 0, 0);
      enemy.active = true;
      enemy.typeIndex = typeIndex;
      enemy.size = type.size;
      enemy.speed = type.baseSpeed * multipliers.speedMultiplier;
      enemy.maxHealth = Math.round(type.baseHealth * multipliers.healthMultiplier);
      enemy.health = enemy.maxHealth;
      return;
    }
  }

  flushSpawns(currentTime) {
    while (this.pendingSpawns.length && this.pendingSpawns[0].spawnAt <= currentTime) {
      const spawn = this.pendingSpawns.shift();
      const enemy = this.enemies.find((item) => !item.active);
      if (enemy) this.activateEnemy(enemy, spawn.typeIndex);
    }
  }

  flowDirection(position, outVec) {
    return this.pathfindingStrategy.getFlowDirection(position, outVec, (x, z) => this.isWall(x, z));
  }

  forceNextWave(now) {
    this.enqueueWave(now);
  }

  update(deltaTime, elapsedTime) {
    if (elapsedTime - this.lastWaveTime >= this.waveInterval) {
      this.enqueueWave(elapsedTime);
    }

    this.flushSpawns(elapsedTime);

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const toHome = this.tempVecA.set(-enemy.position.x, 0, -enemy.position.z);
      if (toHome.lengthSq() < 0.7 * 0.7) {
        enemy.active = false;
        continue;
      }

      const flow = this.flowDirection(enemy.position, this.tempVecB);
      this.steeringStrategy.apply(enemy, this.enemies, flow, deltaTime, this.tempVecA, this.tempVecC);
      enemy.position.addScaledVector(enemy.velocity, deltaTime);
      enemy.position.y = 0.55;
    }

    this.updateTurrets(deltaTime, elapsedTime);
  }
}
