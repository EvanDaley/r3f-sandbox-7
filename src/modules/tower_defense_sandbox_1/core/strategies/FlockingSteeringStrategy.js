export default class FlockingSteeringStrategy {
  constructor({
    neighborRadius = 3.2,
    separationRadius = 1.25,
    flowWeight = 1.6,
    alignmentWeight = 0.5,
    cohesionWeight = 0.45,
    separationWeight = 0.9,
    velocitySmoothing = 3.5,
  } = {}) {
    this.neighborRadiusSq = neighborRadius * neighborRadius;
    this.separationRadiusSq = separationRadius * separationRadius;
    this.flowWeight = flowWeight;
    this.alignmentWeight = alignmentWeight;
    this.cohesionWeight = cohesionWeight;
    this.separationWeight = separationWeight;
    this.velocitySmoothing = velocitySmoothing;
  }

  apply(enemy, enemies, flowDirection, deltaTime, tempVecA, tempVecB) {
    const flow = tempVecA.copy(flowDirection).multiplyScalar(this.flowWeight);

    let alignX = 0;
    let alignZ = 0;
    let cohX = 0;
    let cohZ = 0;
    let sepX = 0;
    let sepZ = 0;
    let neighborCount = 0;

    for (const other of enemies) {
      if (other === enemy || !other.active) continue;

      const dx = enemy.position.x - other.position.x;
      const dz = enemy.position.z - other.position.z;
      const distSq = dx * dx + dz * dz;
      if (distSq > this.neighborRadiusSq) continue;

      neighborCount += 1;
      alignX += other.velocity.x;
      alignZ += other.velocity.z;
      cohX += other.position.x;
      cohZ += other.position.z;

      if (distSq < this.separationRadiusSq && distSq > 0.0001) {
        const inv = 1 / distSq;
        sepX += dx * inv;
        sepZ += dz * inv;
      }
    }

    const steer = tempVecB.copy(flow);

    if (neighborCount > 0) {
      const invCount = 1 / neighborCount;

      tempVecA.set(alignX * invCount, 0, alignZ * invCount).normalize().multiplyScalar(this.alignmentWeight);
      steer.add(tempVecA);

      tempVecA
        .set(cohX * invCount - enemy.position.x, 0, cohZ * invCount - enemy.position.z)
        .normalize()
        .multiplyScalar(this.cohesionWeight);
      steer.add(tempVecA);

      tempVecA.set(sepX, 0, sepZ).normalize().multiplyScalar(this.separationWeight);
      steer.add(tempVecA);
    }

    enemy.velocity.lerp(steer.normalize().multiplyScalar(enemy.speed), Math.min(1, deltaTime * this.velocitySmoothing));
  }
}
