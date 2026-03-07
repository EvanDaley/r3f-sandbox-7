using TowerDefense.Core.Systems;

namespace TowerDefense.Core.Simulation;

public sealed class GameSimulation
{
    public FlowFieldSystem FlowFieldSystem { get; }
    public WaveSpawnSystem WaveSpawnSystem { get; }
    public MovementSystem MovementSystem { get; }
    public CombatSystem CombatSystem { get; }
    public EconomySystem EconomySystem { get; }

    public GameSimulation(
        FlowFieldSystem? flowFieldSystem = null,
        WaveSpawnSystem? waveSpawnSystem = null,
        MovementSystem? movementSystem = null,
        CombatSystem? combatSystem = null,
        EconomySystem? economySystem = null)
    {
        FlowFieldSystem = flowFieldSystem ?? new FlowFieldSystem();
        WaveSpawnSystem = waveSpawnSystem ?? new WaveSpawnSystem();
        MovementSystem = movementSystem ?? new MovementSystem();
        CombatSystem = combatSystem ?? new CombatSystem();
        EconomySystem = economySystem ?? new EconomySystem();
    }

    public void Update(GameState state, float deltaTime)
    {
        FlowFieldSystem.Update(state, deltaTime);
        WaveSpawnSystem.Update(state, deltaTime);
        MovementSystem.Update(state, deltaTime);
        CombatSystem.Update(state, deltaTime);
        EconomySystem.Update(state, deltaTime);
        state.Time += deltaTime;
    }
}
