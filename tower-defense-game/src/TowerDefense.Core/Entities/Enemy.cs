using TowerDefense.Core.Math;

namespace TowerDefense.Core.Entities;

public sealed class Enemy
{
    public int Id { get; set; }
    public int Health { get; set; }
    public int MaxHealth { get; set; }
    public float Speed { get; set; }
    public Vec2 Position { get; set; }
    public bool Alive { get; set; } = true;
    public bool ReachedGoal { get; set; }

    public void TakeDamage(int amount)
    {
        if (!Alive)
        {
            return;
        }

        Health -= amount;
        if (Health <= 0)
        {
            Kill();
        }
    }

    public void Kill()
    {
        Alive = false;
        Health = 0;
    }
}
