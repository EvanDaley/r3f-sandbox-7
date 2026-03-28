# CuteEngine (.NET simulation sandbox)

This folder is a clean C# starting point for simulation-first game logic that runs independently from Unity.

## Projects

- `CuteEngine` - class library with a tiny deterministic simulation loop.
- `CuteEngine.Tests` - xUnit tests that verify engine behavior.

## Run tests

```bash
dotnet test csharp/CuteEngine.sln
```

## What's implemented

- `CuteWorldEngine` to spawn critters, advance time (`Tick`), and export simulation snapshots.
- `Critter` entities with simple energy and mood rules.
- Snapshot record types for assertions, tooling, or later Unity adapters.

## Next steps

- Add gameplay rules/services in `CuteEngine`.
- Keep behavior test-first in `CuteEngine.Tests`.
- Add a Unity-facing adapter that references `CuteEngine` when you're ready.
