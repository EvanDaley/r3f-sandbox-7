using TowerDefense.Core.Math;

namespace TowerDefense.Core.Entities;

public sealed class Tower
{
    public int Id { get; set; }
    public int Damage { get; set; }
    public float Range { get; set; }
    public float Cooldown { get; set; }
    public float CooldownRemaining { get; set; }
    public Vec2 Position { get; set; }
}
