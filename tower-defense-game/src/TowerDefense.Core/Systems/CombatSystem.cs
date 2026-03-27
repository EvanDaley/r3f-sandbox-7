using TowerDefense.Core.Math;
using TowerDefense.Core.Simulation;

namespace TowerDefense.Core.Systems;

public sealed class CombatSystem
{
    public void Update(GameState state, float deltaTime)
    {
        for (var i = 0; i < state.Towers.Count; i++)
        {
            var tower = state.Towers[i];
            tower.CooldownRemaining -= deltaTime;
            if (tower.CooldownRemaining > 0f)
            {
                continue;
            }

            for (var j = 0; j < state.Enemies.Count; j++)
            {
                var enemy = state.Enemies[j];
                if (!enemy.Alive)
                {
                    continue;
                }

                if (Distance.Between(tower.Position, enemy.Position) > tower.Range)
                {
                    continue;
                }

                enemy.TakeDamage(tower.Damage);
                tower.CooldownRemaining = tower.Cooldown;
                break;
            }
        }

        var writeIndex = 0;
        for (var i = 0; i < state.Enemies.Count; i++)
        {
            var enemy = state.Enemies[i];
            if (enemy.Alive || enemy.ReachedGoal)
            {
                state.Enemies[writeIndex++] = enemy;
            }
        }

        if (writeIndex < state.Enemies.Count)
        {
            state.Enemies.RemoveRange(writeIndex, state.Enemies.Count - writeIndex);
        }
    }
}
