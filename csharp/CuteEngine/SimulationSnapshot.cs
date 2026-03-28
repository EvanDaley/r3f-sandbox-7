namespace CuteEngine;

public sealed record CritterState(string Name, int Energy, CritterMood Mood);

public sealed record SimulationSnapshot(int TickCount, IReadOnlyList<CritterState> Critters);
