using TowerDefense.Core.Pathfinding;
using TowerDefense.Core.Simulation;

namespace TowerDefense.Core.Systems;

public sealed class FlowFieldSystem
{
    private readonly FlowFieldGenerator _generator;

    public FlowFieldSystem(FlowFieldGenerator? generator = null)
    {
        _generator = generator ?? new FlowFieldGenerator();
    }

    public void Update(GameState state, float deltaTime)
    {
        if (state.FlowField is null)
        {
            state.FlowField = _generator.Generate(state.Map);
        }
    }
}
