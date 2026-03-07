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
    biomassReward: 1,
    weight: 5,
  },
  {
    id: 'tank',
    label: 'Bulwark Cube',
    color: '#f59e0b',
    size: 1.15,
    baseSpeed: 2.2,
    baseHealth: 140,
    biomassReward: 3,
    weight: 2,
  },
  {
    id: 'striker',
    label: 'Striker Prism',
    color: '#8b5cf6',
    size: 0.9,
    baseSpeed: 3.1,
    baseHealth: 85,
    biomassReward: 2,
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
    this.biomass = 0;

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

  createSaveData() {
    return {
      version: 1,
      grid: {
        size: this.gridSize,
        cellSize: this.cellSize,
      },
      stats: {
        waveNumber: this.waveNumber,
        biomass: this.biomass,
        lastWaveTime: this.lastWaveTime,
        nextTurretFireTime: this.nextTurretFireTime,
      },
      progression: {
        activeAmplifierIds: [...this.activeAmplifierIds],
        pendingSpawns: this.pendingSpawns.map((spawn) => ({
          spawnAt: spawn.spawnAt,
          typeIndex: spawn.typeIndex,
        })),
      },
      structures: {
        walls: [...this.walls],
        turrets: [...this.turrets],
      },
      enemies: this.enemies.map((enemy) => ({
        id: enemy.id,
        active: enemy.active,
        typeIndex: enemy.typeIndex,
        size: enemy.size,
        speed: enemy.speed,
        maxHealth: enemy.maxHealth,
        health: enemy.health,
        position: {
          x: enemy.position.x,
          y: enemy.position.y,
          z: enemy.position.z,
        },
        velocity: {
          x: enemy.velocity.x,
          y: enemy.velocity.y,
          z: enemy.velocity.z,
        },
      })),
      projectiles: this.projectiles.map((projectile) => ({
        ttl: projectile.ttl,
        damage: projectile.damage,
        position: {
          x: projectile.position.x,
          y: projectile.position.y,
          z: projectile.position.z,
        },
        velocity: {
          x: projectile.velocity.x,
          y: projectile.velocity.y,
          z: projectile.velocity.z,
        },
      })),
    };
  }

  loadSaveData(rawData) {
    const data = rawData ?? {};

    const walls = Array.isArray(data?.structures?.walls) ? data.structures.walls : [];
    const turrets = Array.isArray(data?.structures?.turrets) ? data.structures.turrets : [];
    this.setWalls(walls, false);
    this.setTurrets(turrets, false);

    const waveNumber = Number(data?.stats?.waveNumber);
    const biomass = Number(data?.stats?.biomass);
    const lastWaveTime = Number(data?.stats?.lastWaveTime);
    const nextTurretFireTime = Number(data?.stats?.nextTurretFireTime);

    this.waveNumber = Number.isFinite(waveNumber) ? Math.max(0, Math.floor(waveNumber)) : 0;
    this.biomass = Number.isFinite(biomass) ? Math.max(0, biomass) : 0;
    this.lastWaveTime = Number.isFinite(lastWaveTime) ? lastWaveTime : -this.waveInterval;
    this.nextTurretFireTime = Number.isFinite(nextTurretFireTime) ? nextTurretFireTime : 0;

    const amplifierIds = Array.isArray(data?.progression?.activeAmplifierIds) ? data.progression.activeAmplifierIds : [];
    this.activeAmplifierIds = amplifierIds.filter((id) => this.amplifierPool.some((amp) => amp.id === id));

    const pendingSpawns = Array.isArray(data?.progression?.pendingSpawns) ? data.progression.pendingSpawns : [];
    this.pendingSpawns = pendingSpawns
      .map((spawn) => ({
        spawnAt: Number(spawn?.spawnAt),
        typeIndex: Number(spawn?.typeIndex),
      }))
      .filter((spawn) => Number.isFinite(spawn.spawnAt) && Number.isInteger(spawn.typeIndex) && spawn.typeIndex >= 0 && spawn.typeIndex < this.enemyTypes.length)
      .sort((a, b) => a.spawnAt - b.spawnAt);

    const enemyData = Array.isArray(data?.enemies) ? data.enemies : [];
    this.enemies.forEach((enemy) => {
      const savedEnemy = enemyData.find((item) => item?.id === enemy.id);
      if (!savedEnemy) {
        enemy.active = false;
        enemy.velocity.set(0, 0, 0);
        return;
      }

      enemy.active = Boolean(savedEnemy.active);
      enemy.typeIndex = Number.isInteger(savedEnemy.typeIndex) ? THREE.MathUtils.clamp(savedEnemy.typeIndex, 0, this.enemyTypes.length - 1) : 0;
      enemy.size = Number.isFinite(savedEnemy.size) ? savedEnemy.size : this.enemyTypes[enemy.typeIndex].size;
      enemy.speed = Number.isFinite(savedEnemy.speed) ? savedEnemy.speed : this.enemyTypes[enemy.typeIndex].baseSpeed;
      enemy.maxHealth = Number.isFinite(savedEnemy.maxHealth) ? savedEnemy.maxHealth : this.enemyTypes[enemy.typeIndex].baseHealth;
      enemy.health = Number.isFinite(savedEnemy.health) ? Math.min(savedEnemy.health, enemy.maxHealth) : enemy.maxHealth;
      enemy.position.set(
        Number.isFinite(savedEnemy?.position?.x) ? savedEnemy.position.x : 0,
        Number.isFinite(savedEnemy?.position?.y) ? savedEnemy.position.y : 0.55,
        Number.isFinite(savedEnemy?.position?.z) ? savedEnemy.position.z : 0
      );
      enemy.velocity.set(
        Number.isFinite(savedEnemy?.velocity?.x) ? savedEnemy.velocity.x : 0,
        Number.isFinite(savedEnemy?.velocity?.y) ? savedEnemy.velocity.y : 0,
        Number.isFinite(savedEnemy?.velocity?.z) ? savedEnemy.velocity.z : 0
      );
    });

    const projectileData = Array.isArray(data?.projectiles) ? data.projectiles : [];
    this.projectiles = projectileData
      .map((projectile) => {
        const ttl = Number(projectile?.ttl);
        const damage = Number(projectile?.damage);
        if (!Number.isFinite(ttl) || !Number.isFinite(damage) || ttl <= 0) return null;

        return {
          ttl,
          damage,
          position: new THREE.Vector3(
            Number.isFinite(projectile?.position?.x) ? projectile.position.x : 0,
            Number.isFinite(projectile?.position?.y) ? projectile.position.y : 0,
            Number.isFinite(projectile?.position?.z) ? projectile.position.z : 0
          ),
          velocity: new THREE.Vector3(
            Number.isFinite(projectile?.velocity?.x) ? projectile.velocity.x : 0,
            Number.isFinite(projectile?.velocity?.y) ? projectile.velocity.y : 0,
            Number.isFinite(projectile?.velocity?.z) ? projectile.velocity.z : 0
          ),
        };
      })
      .filter(Boolean);

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
    const key = `${cellX},${cellZ}`;
    return this.walls.has(key) || this.turrets.has(key);
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

    this.rebuildFlowField();
  }

  setWalls(wallKeys = [], rebuildFlowField = true) {
    this.walls = new Set(
      wallKeys.filter((key) => {
        const [x, z] = key.split(',').map(Number);
        if (!this.inBounds(x, z)) return false;
        if (x === HOME_CELL.x && z === HOME_CELL.z) return false;
        return true;
      })
    );

    if (rebuildFlowField) {
      this.rebuildFlowField();
    }
  }

  setTurrets(turretKeys = [], rebuildFlowField = true) {
    this.turrets = new Set(
      turretKeys.filter((key) => {
        const [x, z] = key.split(',').map(Number);
        if (!this.inBounds(x, z)) return false;
        if (x === HOME_CELL.x && z === HOME_CELL.z) return false;
        if (this.walls.has(key)) return false;
        return true;
      })
    );

    if (rebuildFlowField) {
      this.rebuildFlowField();
    }
  }

  clearAllStructures() {
    this.walls.clear();
    this.turrets.clear();
    this.rebuildFlowField();
  }

  clearTurrets() {
    this.turrets.clear();
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
          const enemyType = this.enemyTypes[hitEnemy.typeIndex] ?? this.enemyTypes[0];
          this.biomass += enemyType?.biomassReward ?? 1;
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

    for (let attempts = 0; attempts < 100; attempts += 1) {
      const cell = this.randomSpawnCell();
      if (this.isWall(cell.x, cell.z)) continue;
      
      // Edge cells should always be valid for spawning, skip reachability check for them
      const isEdgeCell = Math.abs(cell.x) === this.halfGrid || Math.abs(cell.z) === this.halfGrid;
      if (!isEdgeCell && !this.pathfindingStrategy.isReachableCell(cell.x, cell.z)) continue;
      
      const world = this.cellToWorld(cell.x, cell.z);

      enemy.position.set(world.x, 0.55, world.z);
      enemy.velocity.set(0, 0, 0);
      enemy.active = true;
      enemy.typeIndex = typeIndex;
      enemy.size = type.size;
      enemy.speed = type.baseSpeed * multipliers.speedMultiplier;
      enemy.maxHealth = Math.round(type.baseHealth * multipliers.healthMultiplier);
      enemy.health = enemy.maxHealth;
      return true;
    }

    return false;
  }

  flushSpawns(currentTime) {
    while (this.pendingSpawns.length && this.pendingSpawns[0].spawnAt <= currentTime) {
      const enemy = this.enemies.find((item) => !item.active);
      if (!enemy) break;

      const spawn = this.pendingSpawns.shift();
      const spawned = this.activateEnemy(enemy, spawn.typeIndex);
      if (!spawned) {
        // If we can't spawn this enemy, re-queue it with a small delay to retry
        // This prevents one failed spawn from blocking all others while still retrying
        spawn.spawnAt = currentTime + 0.1;
        this.pendingSpawns.push(spawn);
        // Continue to next spawn to avoid infinite loop if all spawns fail
        continue;
      }
    }
  }

  flowDirection(position, outVec) {
    return this.pathfindingStrategy.getFlowDirection(position, outVec, (x, z) => this.isWall(x, z));
  }

  forceNextWave(now) {
    this.enqueueWave(now);
  }

  update(deltaTime, elapsedTime) {
    this.flushSpawns(elapsedTime);

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;

      const toHome = this.tempVecA.set(-enemy.position.x, 0, -enemy.position.z);
      if (toHome.lengthSq() < 0.7 * 0.7) {
        const enemyType = this.enemyTypes[enemy.typeIndex];
        console.log(`Enemy reached home base and despawned: ${enemyType.label} (${enemyType.id})`);
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
