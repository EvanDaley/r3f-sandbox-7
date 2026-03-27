using TowerDefense.Core.Entities;
using TowerDefense.Core.Simulation;

namespace TowerDefense.Core.Systems;

public sealed class WaveSpawnSystem
{
    public float SpawnInterval { get; }
    public int EnemyHealth { get; }
    public float EnemySpeed { get; }

    public WaveSpawnSystem(float spawnInterval = 1f, int enemyHealth = 10, float enemySpeed = 1f)
    {
        SpawnInterval = spawnInterval;
        EnemyHealth = enemyHealth;
        EnemySpeed = enemySpeed;
    }

    public void Update(GameState state, float deltaTime)
    {
        if (state.EnemiesRemainingInWave <= 0)
        {
            return;
        }

        state.SpawnTimer -= deltaTime;
        if (state.SpawnTimer > 0f)
        {
            return;
        }

        state.Enemies.Add(new Enemy
        {
            Id = state.NextEnemyId++,
            Health = EnemyHealth,
            MaxHealth = EnemyHealth,
            Speed = EnemySpeed,
            Position = state.Map.Spawn,
            Alive = true
        });

        state.EnemiesRemainingInWave--;
        state.SpawnTimer = SpawnInterval;
    }
}
