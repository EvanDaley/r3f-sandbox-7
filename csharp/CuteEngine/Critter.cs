namespace CuteEngine;

public sealed class Critter
{
    public Critter(string name, int startingEnergy = 3)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Critter name is required.", nameof(name));
        }

        Name = name;
        Energy = Math.Max(startingEnergy, 0);
        Mood = CritterMood.Curious;
    }

    public string Name { get; }

    public int Energy { get; private set; }

    public CritterMood Mood { get; private set; }

    public void Recharge(int amount)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Recharge amount cannot be negative.");
        }

        if (amount == 0)
        {
            return;
        }

        Energy += amount;
        Mood = CritterMood.Curious;
    }

    internal void Tick()
    {
        if (Energy == 0)
        {
            Mood = CritterMood.Sleepy;
            return;
        }

        Energy -= 1;
        Mood = Energy == 0 ? CritterMood.Sleepy : CritterMood.Happy;
    }
}
