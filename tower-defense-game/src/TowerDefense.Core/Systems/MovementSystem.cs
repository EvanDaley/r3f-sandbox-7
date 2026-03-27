using TowerDefense.Core.Math;
using TowerDefense.Core.Simulation;

namespace TowerDefense.Core.Systems;

public sealed class MovementSystem
{
    private static readonly (int dx, int dy)[] Directions =
    [
        (1, 0),
        (-1, 0),
        (0, 1),
        (0, -1)
    ];

    public void Update(GameState state, float deltaTime)
    {
        if (state.FlowField is null)
        {
            return;
        }

        var costs = state.FlowField.Cost;
        var goal = state.Map.Goal;

        for (var i = 0; i < state.Enemies.Count; i++)
        {
            var enemy = state.Enemies[i];
            if (!enemy.Alive)
            {
                continue;
            }

            var cx = (int)enemy.Position.X;
            var cy = (int)enemy.Position.Y;

            var bestX = cx;
            var bestY = cy;
            var bestCost = costs[cx, cy];

            for (var d = 0; d < Directions.Length; d++)
            {
                var nx = cx + Directions[d].dx;
                var ny = cy + Directions[d].dy;
                if (!state.Map.InBounds(nx, ny))
                {
                    continue;
                }

                var candidateCost = costs[nx, ny];
                if (candidateCost < bestCost)
                {
                    bestCost = candidateCost;
                    bestX = nx;
                    bestY = ny;
                }
            }

            var target = new Vec2(bestX, bestY);
            var delta = target - enemy.Position;
            var length = Distance.Between(enemy.Position, target);

            if (length > 0.0001f)
            {
                var maxStep = enemy.Speed * deltaTime;
                if (maxStep >= length)
                {
                    enemy.Position = target;
                }
                else
                {
                    var invLength = 1f / length;
                    enemy.Position = enemy.Position + (delta * (maxStep * invLength));
                }
            }

            if (Distance.Between(enemy.Position, goal) <= 0.001f)
            {
                enemy.ReachedGoal = true;
                enemy.Alive = false;
            }
        }
    }
}
