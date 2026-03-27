using TowerDefense.Core.Map;
using TowerDefense.Core.Simulation;
using TowerDefense.Core.Systems;

namespace TowerDefense.Core.Tests;

public class WaveSpawnTests
{
    [Test]
    public void Update_SpawnsEnemyWhenTimerElapsed()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap(), EnemiesRemainingInWave = 2, SpawnTimer = 0f };
        var system = new WaveSpawnSystem(spawnInterval: 0.5f);

        system.Update(state, 0.1f);

        Assert.That(state.Enemies.Count, Is.EqualTo(1));
    }

    [Test]
    public void Update_DecrementsEnemiesRemainingAfterSpawn()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap(), EnemiesRemainingInWave = 2, SpawnTimer = 0f };
        var system = new WaveSpawnSystem(spawnInterval: 0.5f);

        system.Update(state, 0.1f);

        Assert.That(state.EnemiesRemainingInWave, Is.EqualTo(1));
    }
}
