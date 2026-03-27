using TowerDefense.Core.Math;

namespace TowerDefense.Core.Map;

public sealed class GameMap
{
    public int Width { get; }
    public int Height { get; }
    public Tile[,] Tiles { get; }
    public Vec2 Spawn { get; }
    public Vec2 Goal { get; }

    public GameMap(int width, int height, Tile[,] tiles, Vec2 spawn, Vec2 goal)
    {
        Width = width;
        Height = height;
        Tiles = tiles;
        Spawn = spawn;
        Goal = goal;
    }

    public bool InBounds(int x, int y) => x >= 0 && y >= 0 && x < Width && y < Height;
}
