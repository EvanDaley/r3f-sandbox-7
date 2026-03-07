using TowerDefense.Core.Entities;
using TowerDefense.Core.Map;
using TowerDefense.Core.Math;
using TowerDefense.Core.Simulation;
using TowerDefense.Core.Systems;

namespace TowerDefense.Core.Tests;

public class CombatTests
{
    [Test]
    public void Update_TowerDamagesEnemyInRange()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap() };
        state.Towers.Add(new Tower { Id = 1, Damage = 3, Range = 2f, Cooldown = 0.5f, CooldownRemaining = 0f, Position = new Vec2(1, 0) });
        state.Enemies.Add(new Enemy { Id = 1, Health = 10, MaxHealth = 10, Speed = 1f, Position = new Vec2(2, 0), Alive = true });

        new CombatSystem().Update(state, 0.1f);

        Assert.That(state.Enemies[0].Health, Is.EqualTo(7));
    }

    [Test]
    public void Update_EnemyOutOfRangeTakesNoDamage()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap() };
        state.Towers.Add(new Tower { Id = 1, Damage = 3, Range = 1f, Cooldown = 0.5f, CooldownRemaining = 0f, Position = new Vec2(0, 0) });
        state.Enemies.Add(new Enemy { Id = 1, Health = 10, MaxHealth = 10, Speed = 1f, Position = new Vec2(4, 4), Alive = true });

        new CombatSystem().Update(state, 0.1f);

        Assert.That(state.Enemies[0].Health, Is.EqualTo(10));
    }

    [Test]
    public void Update_RemovesDeadEnemiesThatDidNotReachGoal()
    {
        var state = new GameState { Map = MapFactory.CreateSimpleTestMap() };
        state.Towers.Add(new Tower { Id = 1, Damage = 50, Range = 4f, Cooldown = 0.5f, CooldownRemaining = 0f, Position = new Vec2(1, 0) });
        state.Enemies.Add(new Enemy { Id = 1, Health = 10, MaxHealth = 10, Speed = 1f, Position = new Vec2(2, 0), Alive = true });

        new CombatSystem().Update(state, 0.1f);

        Assert.That(state.Enemies.Count, Is.EqualTo(0));
    }
}
