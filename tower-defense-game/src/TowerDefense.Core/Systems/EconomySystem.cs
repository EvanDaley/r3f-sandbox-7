using TowerDefense.Core.Simulation;

namespace TowerDefense.Core.Systems;

public sealed class EconomySystem
{
    public void Update(GameState state, float deltaTime)
    {
        _ = state;
        _ = deltaTime;
    }

    public void AddGold(GameState state, int amount)
    {
        state.Gold += amount;
    }

    public bool CanAfford(GameState state, int amount)
    {
        return state.Gold >= amount;
    }

    public bool SpendGold(GameState state, int amount)
    {
        if (!CanAfford(state, amount))
        {
            return false;
        }

        state.Gold -= amount;
        return true;
    }
}
