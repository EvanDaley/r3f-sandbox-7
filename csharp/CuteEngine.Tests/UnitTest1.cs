using CuteEngine;

namespace CuteEngine.Tests;

public sealed class CuteWorldEngineTests
{
    [Fact]
    public void SpawnCritter_ShouldAddCritterWithDefaultMood()
    {
        var engine = new CuteWorldEngine();

        var critter = engine.SpawnCritter("Mochi");

        Assert.Single(engine.Critters);
        Assert.Equal("Mochi", critter.Name);
        Assert.Equal(3, critter.Energy);
        Assert.Equal(CritterMood.Curious, critter.Mood);
    }

    [Fact]
    public void SpawnCritter_ShouldClampNegativeEnergyToZero()
    {
        var engine = new CuteWorldEngine();

        var critter = engine.SpawnCritter("Bean", startingEnergy: -2);

        Assert.Equal(0, critter.Energy);
        Assert.Equal(CritterMood.Curious, critter.Mood);
    }

    [Fact]
    public void Tick_ShouldAdvanceClockAndDrainEnergy()
    {
        var engine = new CuteWorldEngine();
        engine.SpawnCritter("Puff", startingEnergy: 2);

        engine.Tick();
        engine.Tick();

        var state = engine.Snapshot().Critters.Single();
        Assert.Equal(2, engine.TickCount);
        Assert.Equal(0, state.Energy);
        Assert.Equal(CritterMood.Sleepy, state.Mood);
    }

    [Fact]
    public void Recharge_ShouldWakeSleepyCritter()
    {
        var engine = new CuteWorldEngine();
        var critter = engine.SpawnCritter("Nori", startingEnergy: 1);

        engine.Tick();
        critter.Recharge(2);

        var state = engine.Snapshot().Critters.Single();
        Assert.Equal(2, state.Energy);
        Assert.Equal(CritterMood.Curious, state.Mood);
    }

    [Fact]
    public void SpawnCritter_ShouldRejectBlankName()
    {
        var engine = new CuteWorldEngine();

        Assert.Throws<ArgumentException>(() => engine.SpawnCritter("  "));
    }

    [Fact]
    public void Recharge_ShouldRejectNegativeAmount()
    {
        var critter = new CuteWorldEngine().SpawnCritter("Miso");

        Assert.Throws<ArgumentOutOfRangeException>(() => critter.Recharge(-1));
    }
}
