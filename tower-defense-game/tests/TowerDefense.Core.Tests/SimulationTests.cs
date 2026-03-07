using TowerDefense.Core.Entities;
using TowerDefense.Core.Map;
using TowerDefense.Core.Math;
using TowerDefense.Core.Simulation;
using TowerDefense.Core.Systems;

namespace TowerDefense.Core.Tests;

public class SimulationTests
{
    [Test]
    public void EnemyNavigation_EnemyReachesGoal()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap() };
        state.FlowField = null;
        state.Enemies.Add(new Enemy { Id = 1, Health = 10, MaxHealth = 10, Speed = 1f, Position = state.Map.Spawn, Alive = true });

        var simulation = new GameSimulation(
            waveSpawnSystem: new WaveSpawnSystem(spawnInterval: 1f),
            combatSystem: new CombatSystem());

        for (var i = 0; i < 50; i++)
        {
            simulation.Update(state, 0.25f);
        }

        Assert.That(state.Enemies.Any(e => e.ReachedGoal), Is.True);
    }

    [Test]
    public void SimulationStress_5000FramesRunsWithoutErrors()
    {
        var state = new GameState
        {
            Map = MapFactory.CreateSimpleTestMap(),
            EnemiesRemainingInWave = 3,
            SpawnTimer = 0f
        };

        state.Towers.Add(new Tower { Id = 1, Damage = 1, Range = 1.5f, Cooldown = 0.2f, CooldownRemaining = 0f, Position = new Vec2(2, 2) });
        var simulation = new GameSimulation(waveSpawnSystem: new WaveSpawnSystem(spawnInterval: 0.25f));

        Assert.DoesNotThrow(() =>
        {
            for (var i = 0; i < 5000; i++)
            {
                simulation.Update(state, 0.016f);
            }
        });
    }

    [Test]
    public void DeterministicSimulation_SameSeedProducesSameResult()
    {
        var resultA = RunDeterministicScenario(1234);
        var resultB = RunDeterministicScenario(1234);

        Assert.That(resultA, Is.EqualTo(resultB));
    }

    private static string RunDeterministicScenario(int seed)
    {
        var random = new TowerDefense.Core.Utils.DeterministicRandom(seed);
        var state = new GameState
        {
            Map = MapFactory.CreateSimpleTestMap(),
            EnemiesRemainingInWave = 5,
            SpawnTimer = 0f,
            Gold = random.NextInt(0, 10)
        };

        state.Towers.Add(new Tower
        {
            Id = 1,
            Damage = 2 + random.NextInt(0, 3),
            Range = 1.5f,
            Cooldown = 0.3f,
            CooldownRemaining = 0f,
            Position = new Vec2(2, 1)
        });

        var simulation = new GameSimulation(waveSpawnSystem: new WaveSpawnSystem(spawnInterval: 0.4f));

        for (var i = 0; i < 400; i++)
        {
            simulation.Update(state, 0.05f);
        }

        var reachedGoalCount = state.Enemies.Count(e => e.ReachedGoal);
        var aliveCount = state.Enemies.Count(e => e.Alive);
        return $"{state.Time:F2}:{state.Gold}:{reachedGoalCount}:{aliveCount}:{state.NextEnemyId}";
    }
}
