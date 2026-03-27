using TowerDefense.Core.Math;

namespace TowerDefense.Core.Map;

public static class MapFactory
{
    public static GameMap CreateSimpleTestMap()
    {
        var layout = new[]
        {
            "S....",
            "#.#..",
            "...#.",
            ".###.",
            "....G"
        };

        var height = layout.Length;
        var width = layout[0].Length;
        var tiles = new Tile[width, height];
        Vec2 spawn = default;
        Vec2 goal = default;

        for (var y = 0; y < height; y++)
        {
            for (var x = 0; x < width; x++)
            {
                var c = layout[y][x];
                var type = c switch
                {
                    'S' => TileType.Spawn,
                    'G' => TileType.Goal,
                    '#' => TileType.Wall,
                    _ => TileType.Empty
                };

                tiles[x, y] = new Tile(type);
                if (type == TileType.Spawn)
                {
                    spawn = new Vec2(x, y);
                }
                else if (type == TileType.Goal)
                {
                    goal = new Vec2(x, y);
                }
            }
        }

        return new GameMap(width, height, tiles, spawn, goal);
    }
}
