# AI TODO

This file tracks the next practical work items for the ai module.

Status baseline:

1. Steps 1-8 are implemented.
2. Current focus is optimization, quality hardening, and production readiness.

## Now

1. Step 9 tuning pass for Beam scoring and pruning

- Goal: improve decision quality without breaking safety guarantees.
- Areas: ubeam_scorer.pas, ubeam_tactical_filters.pas, ubeam_search_core.pas.
- Validation: extend replay/golden cases in tests/.testdata and keep make test green.

1. Add more golden snapshots from real matches

- Goal: detect regressions in decision quality over time.
- Areas: tests/.testdata, test_replay_golden_format.pas.
- Validation: snapshot parser and decision checks pass in test suite.

1. Time-budget aware stop criteria in search core

- Goal: align beam execution better with TimeBudgetMs contract.
- Areas: ubeam_search_core.pas.
- Validation: deterministic behavior preserved; no fallback regressions.

## Next

1. Strength-profile fine tuning

- Revisit BuildBeamConfigFromStrength defaults for easy/normal/hard.
- File: ubeam_config_profiles.pas.

1. Opponent model improvement

- Replace baseline neutral opponent plans with simple predictive heuristics.
- File: ubeam_opponent_model.pas.

1. Expanded movement edge cases

- Add more corner and boundary scenarios to movement tests.
- File: tests/test_ubeam_movement.pas.

## Later

1. Optional telemetry-friendly debug aggregation

- Aggregate key debug metrics for easier balancing sessions.
- Files: ubeam_search_core.pas, uai_planning_core.pas.

1. Optional dedicated benchmark harness

- Compare candidate scoring/search behavior on static snapshots.
- Location: tests/ or dedicated benchmark tool under ai/.

1. Documentation refresh after Step 9/10 completion

- Update README.md and ARCHITECTURE.md with finalized tuning strategy.

## Done Milestones

1. Step 2: internal architecture and stable DLL contract
2. Step 3: Beam core API and baseline search surface
3. Step 4: state adapter normalization
4. Step 5: movement model modules
5. Step 6: beam decision pipeline implementation
6. Step 7: DLL integration hardening
7. Step 8: multi-stage test coverage (core/movement/contract/replay format)
