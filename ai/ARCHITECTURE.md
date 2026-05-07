# AI Architecture

This document describes the internal architecture of the AI module in the ai folder.

## 1) Goals

1. Keep DLL contract stable for server compatibility.
2. Separate runtime, adapter, and planning responsibilities.
3. Keep planning deterministic and testable.
4. Fail safely with neutral commands when state is invalid.

## 2) Non-Negotiable Boundary

External DLL exports are fixed:

1. AiInit
2. AiDeInit
3. AiInterfaceVersion
4. AiVersion
5. AiNewRound
6. AiHandlePlayer

No new export is required for planner evolution.

## 3) Layered Design

## 3.1 Entry Layer

Files:

1. ai.lpr

Responsibilities:

1. Export symbols with stable signatures.
2. Forward calls into runtime layer.
3. Keep no heavy logic in DLL boundary code.

## 3.2 Runtime Layer

Files:

1. uai_runtime.pas
2. uai_agent.pas

Responsibilities:

1. Manage per-player agent instances.
2. Handle lifecycle (init, new round, deinit).
3. Route per-tick calls to the right agent.
4. Return safe fallback command for invalid indices or uninitialized state.

## 3.3 Adapter Layer

Files:

1. uai_adapter.pas

Responsibilities:

1. Convert TAiInfo to internal planning state.
2. Normalize coordinates and tile data.
3. Provide blocker maps and derived neighbor information.
4. Shield planner from raw protocol shape changes.

Primary outputs:

1. TAgentState
2. TBeamInputState

## 3.4 Planning Orchestration Layer

Files:

1. uai_planning_core.pas

Responsibilities:

1. Map round strength to Beam config.
2. Invoke Beam API for each player tick.
3. Convert Beam command to TAiCommand.
4. Enforce safe fallback on planner failure/fallback.

## 3.5 Beam Core Layer

Files:

1. ubeam_api.pas
2. ubeam_search_core.pas
3. ubeam_candidates.pas
4. ubeam_tactical_filters.pas
5. ubeam_simulator.pas
6. ubeam_scorer.pas
7. ubeam_opponent_model.pas
8. ubeam_config_profiles.pas
9. ubeam_irandom.pas
10. ubeam_types.pas

Responsibilities:

1. Generate candidate actions.
2. Apply tactical pruning.
3. Simulate next states.
4. Score and select best first move.
5. Expose debug metrics for tuning.

## 3.6 Movement Semantics Layer

Files:

1. ubeam_move_types.pas
2. ubeam_move_rules.pas
3. ubeam_move_collision.pas
4. ubeam_move_transition.pas
5. ubeam_move_integrator.pas

Responsibilities:

1. Server-near movement semantics.
2. Continuous and tile-based consistency.
3. Centering, epsilon corridor, and blocker handling.

## 4) End-to-End Tick Flow

1. Server calls AiHandlePlayer.
2. Runtime validates player index and agent availability.
3. Agent builds normalized state via adapter.
4. Planning core reads active config.
5. BeamPlanNextMove executes search pipeline.
6. Best beam command is mapped back to TAiCommand.
7. On invalid/unsafe path, neutral command is returned.

## 5) Configuration and Debug Weights

### 5.1 TBeamConfig structure

`TBeamConfig` (defined in `ubeam_types.pas`, built by `ubeam_config_profiles.pas`) is the
central knob for both production tuning and AI debugging. It has three groups of fields:

**Beam search parameters** — control search breadth and depth:

| Field | Meaning |
|---|---|
| `BeamWidth` | Max candidates kept per depth level (global beam) |
| `LocalBeamWidth` | Max candidates per tile bucket (local beam) |
| `MaxDepth` | Maximum search depth in ticks |
| `NodeBudget` | Hard cap on total expanded nodes |
| `TimeBudgetMs` | Wall-clock budget (0 = unlimited) |
| `RandomTieBreakerSeed` | LCG seed for reproducible tie-breaking |

**Enable flags** — Boolean switches for individual sub-systems:

| Field | Effect |
|---|---|
| `EnableOpponentPrediction` | Use opponent movement models |
| `EnableFirstMovePruning` | Apply tactical filters (survivability + kill-risk) |
| `EnableSurvivabilityChecks` | Prune candidates where player is dead after move |
| `EnableDedupByHash` | Skip duplicate beam states by position hash |

**Strategy weights** — `Byte` values `0..100` per named strategy:

| Value | Meaning |
|---|---|
| `0` | Strategy never activates |
| `1..99` | Strategy activates probabilistically (roll via `RollStrategyWeight`) |
| `100` | Strategy always activates |

Weights correspond to the strategy plans in `ai/.plan/`:

| Field | Plan |
|---|---|
| `StratSafeCorridorWeight` / `StratTriggerTimingWeight` | strat.plan-1 |
| `StratTrapSetupWeight` / `StratBombChainWeight` | strat.plan-2 |
| `StratZoneControlWeight` / `StratPhaseTempoWeight` | strat.plan-3 |
| `StratOpponentProfileWeight` / `StratTeamplayWeight` | strat.plan-4 |
| `StratItemValueWeight` / `StratAntiStallWeight` | strat.plan-5 |
| `StratRiskBudgetWeight` / `StratTimeBudgetStopWeight` | strat.plan-6 |

### 5.2 Profile defaults

| Profile | Strat weights | Use case |
|---|---|---|
| Easy (`0-33`) | all 0 (off) | Vanilla beam, no strategies |
| Normal (`34-66`) | all 50 (probabilistic) | Mixed behavior |
| Hard (`67-100`) | all 100 (always) | Full strategy activation |

### 5.3 RollStrategyWeight

`RollStrategyWeight(Weight, Rng)` in `ubeam_irandom.pas` is the single call-site for
all probability rolls. Using the same `RandomTieBreakerSeed` makes all rolls
fully reproducible across test runs.

### 5.4 Debugging a single strategy

To isolate one strategy and disable all others:

```pascal
Config := BuildBeamConfigFromStrength(100); // start from Hard
SetAllStratWeights(Config, 0);              // disable everything
Config.StratBombChainWeight := 100;         // force only this one
```

## 6) Configuration Flow

1. AiNewRound(strength) is called by server.
2. Runtime forwards to all agents.
3. Planning core maps strength to profile config.
4. Config is validated/clamped before search.

## 6) Safety Model

Fallback command:

1. action = apNone
2. move = amNone

Fallback is used when:

1. Invalid player index.
2. Uninitialized runtime/agent.
3. Invalid focus state.
4. Planner exception.
5. No valid candidate under constraints.

## 7) Test Architecture

Test runner:

1. tests/ai_tests.lpr

Test tiers:

1. Beam core unit tests.
2. Movement semantics tests.
3. DLL export contract tests.
4. Replay/golden format tests.

Key principle: planner and movement logic are testable without running server or OpenGL.

## 8) Extension Points

1. Improve ubeam_tactical_filters for stronger risk filtering.
2. Extend ubeam_opponent_model with richer prediction.
3. Improve ubeam_scorer weighting and feature terms.
4. Add replay-based regression datasets in tests/.testdata.
5. Integrate time-budget aware stopping in search core.

## 9) Important Entry Files

1. ai.lpr
2. uai_runtime.pas
3. uai_planning_core.pas
4. uai_adapter.pas
5. ubeam_api.pas
6. ubeam_search_core.pas

## 10) Planning Reference

For active tasks and prioritization, see:

1. TODO.md
