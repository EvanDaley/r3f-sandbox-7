namespace TowerDefense.Core.Pathfinding;

public sealed class FlowField
{
    public int[,] Cost { get; }

    public FlowField(int[,] cost)
    {
        Cost = cost;
    }
}
