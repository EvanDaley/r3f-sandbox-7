using TowerDefense.Core.Entities;
using TowerDefense.Core.Map;
using TowerDefense.Core.Pathfinding;

namespace TowerDefense.Core.Simulation;

public sealed class GameState
{
    public required GameMap Map { get; init; }
    public FlowField? FlowField { get; set; }
    public List<Enemy> Enemies { get; } = [];
    public List<Tower> Towers { get; } = [];
    public int Gold { get; set; }
    public int Wave { get; set; }
    public float Time { get; set; }
    public int EnemiesRemainingInWave { get; set; }
    public float SpawnTimer { get; set; }
    public int NextEnemyId { get; set; } = 1;
}
