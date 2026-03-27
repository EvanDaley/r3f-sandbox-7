namespace TowerDefense.Core.Utils;

public sealed class DeterministicRandom
{
    private readonly Random _random;

    public DeterministicRandom(int seed)
    {
        _random = new Random(seed);
    }

    public int NextInt(int minInclusive, int maxExclusive) => _random.Next(minInclusive, maxExclusive);

    public float NextFloat() => _random.NextSingle();
}
