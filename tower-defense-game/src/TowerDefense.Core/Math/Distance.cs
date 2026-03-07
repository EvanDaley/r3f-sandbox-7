namespace TowerDefense.Core.Math;

public static class Distance
{
    public static float Between(Vec2 a, Vec2 b)
    {
        var dx = a.X - b.X;
        var dy = a.Y - b.Y;
        return float.Sqrt(dx * dx + dy * dy);
    }
}
