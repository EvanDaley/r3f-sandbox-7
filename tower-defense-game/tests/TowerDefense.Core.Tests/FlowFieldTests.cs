using TowerDefense.Core.Map;
using TowerDefense.Core.Pathfinding;

namespace TowerDefense.Core.Tests;

public class FlowFieldTests
{
    [Test]
    public void Generate_SpawnTileHasFiniteCost()
    {
        var map = MapFactory.CreateSimpleTestMap();
        var field = new FlowFieldGenerator().Generate(map);

        var spawnCost = field.Cost[(int)map.Spawn.X, (int)map.Spawn.Y];
        Assert.That(spawnCost, Is.Not.EqualTo(int.MaxValue));
    }

    [Test]
    public void Generate_GoalTileCostIsZero()
    {
        var map = MapFactory.CreateSimpleTestMap();
        var field = new FlowFieldGenerator().Generate(map);

        Assert.That(field.Cost[(int)map.Goal.X, (int)map.Goal.Y], Is.EqualTo(0));
    }

    [Test]
    public void Generate_WallTileRemainsUnreachable()
    {
        var map = MapFactory.CreateSimpleTestMap();
        var field = new FlowFieldGenerator().Generate(map);

        Assert.That(field.Cost[0, 1], Is.EqualTo(int.MaxValue));
    }
}
