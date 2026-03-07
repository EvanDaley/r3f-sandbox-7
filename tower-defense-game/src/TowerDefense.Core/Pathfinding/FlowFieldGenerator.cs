using TowerDefense.Core.Map;

namespace TowerDefense.Core.Pathfinding;

public sealed class FlowFieldGenerator
{
    private static readonly (int dx, int dy)[] Directions =
    [
        (1, 0),
        (-1, 0),
        (0, 1),
        (0, -1)
    ];

    public FlowField Generate(GameMap map)
    {
        var cost = new int[map.Width, map.Height];
        for (var y = 0; y < map.Height; y++)
        {
            for (var x = 0; x < map.Width; x++)
            {
                cost[x, y] = int.MaxValue;
            }
        }

        var queueX = new int[map.Width * map.Height];
        var queueY = new int[map.Width * map.Height];
        var head = 0;
        var tail = 0;

        var goalX = (int)map.Goal.X;
        var goalY = (int)map.Goal.Y;
        cost[goalX, goalY] = 0;
        queueX[tail] = goalX;
        queueY[tail] = goalY;
        tail++;

        while (head < tail)
        {
            var x = queueX[head];
            var y = queueY[head];
            head++;

            var currentCost = cost[x, y];
            for (var i = 0; i < Directions.Length; i++)
            {
                var nx = x + Directions[i].dx;
                var ny = y + Directions[i].dy;
                if (!map.InBounds(nx, ny))
                {
                    continue;
                }

                if (map.Tiles[nx, ny].Type == TileType.Wall)
                {
                    continue;
                }

                var nextCost = currentCost + 1;
                if (nextCost >= cost[nx, ny])
                {
                    continue;
                }

                cost[nx, ny] = nextCost;
                queueX[tail] = nx;
                queueY[tail] = ny;
                tail++;
            }
        }

        return new FlowField(cost);
    }
}
