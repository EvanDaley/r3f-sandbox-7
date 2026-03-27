using TowerDefense.Core.Map;

namespace TowerDefense.Core.Tests;

public class MapTests
{
    [Test]
    public void CreateSimpleTestMap_HasExpectedDimensions()
    {
        var map = MapFactory.CreateSimpleTestMap();

        Assert.Multiple(() =>
        {
            Assert.That(map.Width, Is.EqualTo(5));
            Assert.That(map.Height, Is.EqualTo(5));
        });
    }

    [Test]
    public void CreateSimpleTestMap_HasSpawnAndGoal()
    {
        var map = MapFactory.CreateSimpleTestMap();

        Assert.Multiple(() =>
        {
            Assert.That(map.Tiles[(int)map.Spawn.X, (int)map.Spawn.Y].Type, Is.EqualTo(TileType.Spawn));
            Assert.That(map.Tiles[(int)map.Goal.X, (int)map.Goal.Y].Type, Is.EqualTo(TileType.Goal));
        });
    }
}
