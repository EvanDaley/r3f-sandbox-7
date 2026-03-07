namespace CuteEngine;

public sealed class CuteWorldEngine
{
    private readonly List<Critter> _critters = new();

    public int TickCount { get; private set; }

    public IReadOnlyList<Critter> Critters => _critters;

    public Critter SpawnCritter(string name, int startingEnergy = 3)
    {
        var critter = new Critter(name, startingEnergy);
        _critters.Add(critter);
        return critter;
    }

    public void Tick()
    {
        foreach (var critter in _critters)
        {
            critter.Tick();
        }

        TickCount++;
    }

    public SimulationSnapshot Snapshot()
    {
        var states = _critters
            .Select(critter => new CritterState(critter.Name, critter.Energy, critter.Mood))
            .ToArray();

        return new SimulationSnapshot(TickCount, states);
    }
}
