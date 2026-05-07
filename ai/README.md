# AI Module

This folder contains the production AI DLL and all AI-focused tests for FPC Atomic Bomberman.

The goal of this README is to give you a practical onboarding path:

1. Start quickly (build and run tests)
2. Understand the flow from DLL export to decision output
3. Dive into Beam planner internals and test strategy

Quick entry point:

1. See QUICKSTART: [QUICKSTART.md](QUICKSTART.md)
2. Architecture reference: [ARCHITECTURE.md](ARCHITECTURE.md)
3. Active work items: [TODO.md](TODO.md)

## 1) Quick Start

If you want the shortest possible onboarding first:

1. [QUICKSTART.md](QUICKSTART.md)

### Requirements

1. GNU Make or compatible make
2. Free Pascal Compiler (fpc)

On Windows, the Makefile uses the configured Lazarus/FPC path by default.
If needed, override it:

```powershell
make FPC=C:/path/to/fpc.exe build
```

On Linux, fpc is taken from PATH.

### Most Useful Commands

Build DLL only:

```sh
make build
```

Build DLL and run all tests:

```sh
make test
```

Default workflow (same as make all):

```sh
make
```

Clean generated files:

```sh
make clean
```

### Build Output

1. Windows: ai.dll
2. Linux: libai.so
3. Test executable: tests/ai_tests(.exe)
4. Test object output: tests/build

## 2) External Contract (What Must Stay Stable)

The server loads this AI as a drop-in DLL. Export names and signatures must remain unchanged.

Stable exports:

1. AiInit
2. AiDeInit
3. AiInterfaceVersion
4. AiVersion
5. AiNewRound
6. AiHandlePlayer

All exports use cdecl.

Compatibility rule: if this contract changes, server loading breaks.

## 3) Runtime Flow (Simple Mental Model)

For each game tick:

1. Server calls AiHandlePlayer(player, aiInfo)
2. Runtime selects the player agent
3. Adapter normalizes TAiInfo into Beam input state
4. Planning core calls Beam API
5. Beam returns decision command
6. Command is mapped back to TAiCommand

If anything is invalid or unsafe, a neutral fallback command is returned:

1. action = apNone
2. move = amNone

## 4) Architecture (From High-Level to Detailed)

### 4.1 Entry and Lifecycle Layer

1. ai.lpr
2. uai_runtime.pas
3. uai_agent.pas

Responsibilities:

1. Keep DLL boundary minimal
2. Manage agent lifecycle safely
3. Route per-player calls
4. Prevent crashes from crossing DLL boundary

### 4.2 Adapter Layer

1. uai_adapter.pas

Responsibilities:

1. Convert TAiInfo to internal agent and Beam state
2. Normalize tile and continuous coordinates
3. Build blocker maps and bomb/player metadata
4. Handle invalid inputs via fallback state

Important mapped values include:

1. Position, TileX, TileY
2. OffsetToCenterX, OffsetToCenterY, DistanceToCenter
3. Neighbor tile classifications
4. TileBlocked and TileRawIds

### 4.3 Planning Layer

1. uai_planning_core.pas
2. ubeam_api.pas
3. ubeam_search_core.pas

Responsibilities:

1. Store round config (mapped from strength)
2. Run Beam planning pipeline
3. Return safe fallback command when planning fails or no safe candidate exists

### 4.4 Beam Core Modules

Core data and config:

1. ubeam_types.pas
2. ubeam_config_profiles.pas

Search pipeline helpers:

1. ubeam_candidates.pas
2. ubeam_tactical_filters.pas
3. ubeam_simulator.pas
4. ubeam_scorer.pas
5. ubeam_search_core.pas

Supporting modules:

1. ubeam_opponent_model.pas
2. ubeam_irandom.pas

Movement model modules (server-near semantics):

1. ubeam_move_types.pas
2. ubeam_move_rules.pas
3. ubeam_move_collision.pas
4. ubeam_move_transition.pas
5. ubeam_move_integrator.pas

## 5) Difficulty and Round Handling

AiNewRound(strength) maps strength to Beam config profile:

1. 0-33 -> Easy
2. 34-66 -> Normal
3. 67-100 -> Hard

Config is clamped and validated before use.

Each difficulty also sets per-strategy activation weights in `TBeamConfig`
(Easy=0/off, Normal=50/probabilistic, Hard=100/always). Individual weights can
be overridden for AI debugging — set a weight to 0 to disable a strategy, to
100 to always force it, or to 1-99 for probabilistic activation. See
[ARCHITECTURE.md](ARCHITECTURE.md) section 5 for the full reference.

Round reset guarantees:

1. New config is applied for all agents
2. Old round state is discarded
3. Runtime remains safe for repeated init/deinit calls

## 6) Safety and Fallback Behavior

Safety is a hard requirement, not optional behavior.

Rules:

1. Invalid player index -> neutral command
2. Uninitialized runtime -> neutral command
3. Planning exception -> neutral command
4. No valid candidate or invalid budget -> fallback decision -> neutral command
5. Repeated AiDeInit must not crash

## 7) Test Strategy (What Is Covered)

### Stage 1: Beam Core Unit Tests

Covers:

1. Config validation and clamping
2. Candidate generation
3. Dedup and local/global beam behavior via metrics
4. Tactical pruning (survivability and kill-risk)
5. Scoring invariants (dead penalty dominates)
6. Fallback cases (for example NodeBudget = 0)
7. Determinism with fixed seed

### Stage 2: Movement Semantics Tests

Covers:

1. Straight movement
2. Centering and tile transitions
3. Turn behavior around center
4. Blocker collision stop/snap
5. Direction consistency after turn

### Stage 3: DLL Contract Tests

Covers:

1. Export presence and callability via dynamic loading
2. Interface version and version string
3. AiInit/AiDeInit stability
4. AiNewRound for all strengths
5. AiHandlePlayer for valid and edge-case inputs
6. Repeated calls and double deinit safety

### Stage 4: Replay/Golden Preparation

Prepared:

1. Snapshot format parser test
2. Sample golden snapshot file under tests/.testdata

Purpose:

1. Later compare decision regressions against recorded game snapshots

## 8) Techniques Used

1. Free Pascal DLL module design with stable C-style exports
2. Layered architecture (entry, runtime, adapter, planner, Beam core)
3. Guard-clause-heavy defensive coding
4. Deterministic tie-breaking via injected random interface
5. Beam search with pruning, deduplication, and staged selection
6. Server-near movement simulation (continuous + tile model)
7. Contract tests using dynamic library loading
8. FPCUnit-based multi-level testing

## 9) Important Locations You Should Know

Entry and lifecycle:

1. ai.lpr
2. uai_runtime.pas
3. uai_agent.pas

Adapter and command mapping:

1. uai_adapter.pas
2. uai_safecommand.pas
3. uai_planning_core.pas

Beam planning core:

1. ubeam_types.pas
2. ubeam_api.pas
3. ubeam_search_core.pas
4. ubeam_candidates.pas
5. ubeam_scorer.pas
6. ubeam_tactical_filters.pas
7. ubeam_simulator.pas
8. ubeam_opponent_model.pas
9. ubeam_irandom.pas

Movement model:

1. ubeam_move_types.pas
2. ubeam_move_rules.pas
3. ubeam_move_collision.pas
4. ubeam_move_transition.pas
5. ubeam_move_integrator.pas

Tests and test data:

1. tests/ai_tests.lpr
2. tests/test_ubeam_search.pas
3. tests/test_ubeam_movement.pas
4. tests/test_dll_contract_exports.pas
5. tests/test_replay_golden_format.pas
6. tests/.testdata/golden_snapshot_v1.txt

Build and planning references:

1. Makefile
2. ../.plan/plan-step_2.prompt.md to plan-step_10.prompt.md