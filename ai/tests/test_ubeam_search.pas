(******************************************************************************)
(*                                                                            *)
(* Author      : GitHub Copilot                                               *)
(*                                                                            *)
(* This file is part of FPC_Atomic                                            *)
(*                                                                            *)
(*  See the file license.md, located under:                                   *)
(*  https://github.com/PascalCorpsman/Software_Licenses/blob/main/license.md  *)
(*  for details about the license.                                            *)
(*                                                                            *)
(*               It is not allowed to change or remove this text from any     *)
(*               source file of the project.                                  *)
(*                                                                            *)
(******************************************************************************)
Unit test_ubeam_search;

{$MODE ObjFPC}{$H+}

Interface

Uses
      fpcunit,
      testregistry,
      ubeam_types,
      ubeam_irandom,
      ubeam_candidates,
      ubeam_scorer,
      ubeam_search_core,
      ubeam_config_profiles;

Type
      TBeamSearchTests = Class(TTestCase)
      Published
            // 1. Candidate generation covers all 5 moves with baNone
            Procedure TestCandidateGenerationCount;
            // 2. Full search on an open state returns a non-fallback decision
            Procedure TestSearchProducesDecision;
            // 3. NodeBudget=1 forces early termination; still returns a result
            Procedure TestNodeBudgetLimitsExpansion;
            // 4. Dead focus player triggers fallback
            Procedure TestDeadPlayerFallback;
            // 5. Scorer returns DeadPenalty for a dead player
            Procedure TestScorerDeadPlayer;
            // 6. Open field gives higher score than partially walled-in
            Procedure TestScorerPrefersMobility;
            // 7. Config clamping keeps custom values in valid ranges
            Procedure TestConfigValidationClamp;
            // 8. Dedup by hash should detect duplicates in same tile
            Procedure TestDedupHitsWithDuplicateStates;
            // 9. Local beam should drop excess states per tile bucket
            Procedure TestLocalBeamDropsWhenLocalWidthIsOne;
            // 10. Kill-risk pruning should count unsafe idle candidates
            Procedure TestKillRiskPruningMetric;
            // 11. NodeBudget 0 must force safe fallback
            Procedure TestNodeBudgetZeroUsesFallback;
            // 12. Same seed + input gives deterministic decision
            Procedure TestDeterminismWithSameSeed;
            // 13. RollStrategyWeight: weight 0 never activates
            Procedure TestStratWeightZeroNeverRolls;
            // 14. RollStrategyWeight: weight 100 always activates
            Procedure TestStratWeightHundredAlwaysRolls;
            // 15. RollStrategyWeight: weight 50 produces both outcomes
            Procedure TestStratWeightFiftyIsProbabilistic;
      End;

Implementation

Const
      FW = 15;
      FH = 11;

// ---------------------------------------------------------------------------
// State builders
// ---------------------------------------------------------------------------

Function MakeOpenField(): TBeamBooleanArray;
Var
      I: Integer;
Begin
      Result := Nil;
      SetLength(Result, FW * FH);
      For I := 0 To FW * FH - 1 Do
            Result[I] := False;
End;

Function MakeOpenKinds(): TBeamTileKindArray;
Var
      I: Integer;
Begin
      Result := Nil;
      SetLength(Result, FW * FH);
      For I := 0 To FW * FH - 1 Do
            Result[I] := btNeutral;
End;

Function MakeAlivePlayer(TX, TY: Integer): TBeamPlayerState;
Begin
      Result := Default(TBeamPlayerState);
      Result.Position.X      := TX + 0.5;
      Result.Position.Y      := TY + 0.5;
      Result.TileX           := TX;
      Result.TileY           := TY;
      Result.DistanceToCenter := 0.0;
      Result.Alive           := True;
      Result.MoveDirection   := bmdNone;
End;

Function MakeSimpleState(FocusIdx: Integer; Alive: Boolean): TBeamInputState;
Var
      I: Integer;
Begin
      Result := Default(TBeamInputState);
      Result.FieldWidth       := FW;
      Result.FieldHeight      := FH;
      Result.FocusPlayerIndex := FocusIdx;
      Result.HasFallbackState := False;
      Result.TileBlocked      := MakeOpenField();
      Result.FieldKinds       := MakeOpenKinds();
      Result.Bombs            := Nil;
      SetLength(Result.Players, 1);
      Result.Players[0]       := MakeAlivePlayer(7, 5);
      Result.Players[0].Alive := Alive;
      Result.Self             := Result.Players[0];
      Result.TileRawIds       := Nil;
      SetLength(Result.TileRawIds, FW * FH);
      For I := 0 To FW * FH - 1 Do
            Result.TileRawIds[I] := 0;
End;

Function MakeEasyConfig(): TBeamConfig;
Begin
      Result := Default(TBeamConfig);
      Result.Profile                  := bdEasy;
      Result.BeamWidth                := 6;
      Result.LocalBeamWidth           := 3;
      Result.MaxDepth                 := 2;
      Result.NodeBudget               := 200;
      Result.TimeBudgetMs             := 50;
      Result.RandomTieBreakerSeed     := 42;
      Result.EnableOpponentPrediction := False;
      Result.EnableFirstMovePruning   := True;
      Result.EnableSurvivabilityChecks := False;
      Result.EnableDedupByHash        := True;
End;

Function MakeRng(): IRandom;
Begin
      Result := TLcgRandom.Create(42);
End;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

Procedure TBeamSearchTests.TestCandidateGenerationCount;
Var
      State     : TBeamInputState;
      Candidates: TBeamCommandArray;
      I, NoneCount: Integer;
Begin
      State      := MakeSimpleState(0, True);
      Candidates := GenerateCandidates(State);

      // 5 moves × 2 actions (baNone + baFirst) = 10, no CanTrigger
      AssertEquals('Candidate count (no trigger)', 10, Length(Candidates));

      NoneCount := 0;
      For I := 0 To High(Candidates) Do Begin
            If Candidates[I].Action = baNone Then
                  Inc(NoneCount);
      End;
      AssertEquals('baNone appears for each move', 5, NoneCount);
End;

Procedure TBeamSearchTests.TestSearchProducesDecision;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Rng   : IRandom;
      Dec   : TBeamDecision;
Begin
      State  := MakeSimpleState(0, True);
      Config := MakeEasyConfig();
      Plans  := Nil;
      Rng    := MakeRng();

      Dec := RunBeamSearch(State, 0, Config, Plans, Rng);

      AssertFalse('FallbackUsed must be False', Dec.Debug.FallbackUsed);
      AssertTrue('EvaluatedNodes > 0', Dec.Debug.EvaluatedNodes > 0);
      AssertTrue('SelectedDepth > 0', Dec.Debug.SelectedDepth > 0);
End;

Procedure TBeamSearchTests.TestNodeBudgetLimitsExpansion;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Rng   : IRandom;
      Dec   : TBeamDecision;
Begin
      State      := MakeSimpleState(0, True);
      Config     := MakeEasyConfig();
      Config.NodeBudget := 1; // force stop after first evaluation
      Plans      := Nil;
      Rng        := MakeRng();

      Dec := RunBeamSearch(State, 0, Config, Plans, Rng);

      // Even with budget=1, must produce a result (not fallback due to budget)
      AssertFalse('Must return a decision, not fallback', Dec.Debug.FallbackUsed);
      AssertTrue('EvaluatedNodes <= budget', Dec.Debug.EvaluatedNodes <= 1);
End;

Procedure TBeamSearchTests.TestDeadPlayerFallback;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Rng   : IRandom;
      Dec   : TBeamDecision;
Begin
      State  := MakeSimpleState(0, False {dead});
      Config := MakeEasyConfig();
      Plans  := Nil;
      Rng    := MakeRng();

      Dec := RunBeamSearch(State, 0, Config, Plans, Rng);

      AssertTrue('Dead player must use fallback', Dec.Debug.FallbackUsed);
      AssertEquals('Dead command move = bmNone', Ord(bmNone), Ord(Dec.Command.Move));
      AssertEquals('Dead command action = baNone', Ord(baNone), Ord(Dec.Command.Action));
End;

Procedure TBeamSearchTests.TestScorerDeadPlayer;
Var
      State: TBeamInputState;
      Score: Single;
Begin
      State       := MakeSimpleState(0, False {dead});
      Score       := ScoreState(State);
      AssertTrue('Dead player score is large negative', Score < -1000.0);
End;

Procedure TBeamSearchTests.TestScorerPrefersMobility;
Var
      OpenState  : TBeamInputState;
      WalledState: TBeamInputState;
      I          : Integer;
      OpenScore  : Single;
      WalledScore: Single;
Begin
      OpenState   := MakeSimpleState(0, True);
      WalledState := MakeSimpleState(0, True);

      // Wall off all 4 neighbors of player at (7,5) in the walled state
      WalledState.FieldKinds[(5)  * FW + 6] := btBlocked; // left
      WalledState.FieldKinds[(5)  * FW + 8] := btBlocked; // right
      WalledState.FieldKinds[(4)  * FW + 7] := btBlocked; // up
      WalledState.FieldKinds[(6)  * FW + 7] := btBlocked; // down
      // also update TileBlocked so WasBlocked is consistent (optional)
      For I := 0 To High(WalledState.TileBlocked) Do
            WalledState.TileBlocked[I] := False;

      OpenScore   := ScoreState(OpenState);
      WalledScore := ScoreState(WalledState);

      AssertTrue('Open field scores higher than walled-in', OpenScore > WalledScore);
End;

Procedure TBeamSearchTests.TestConfigValidationClamp;
Var
      InCfg, OutCfg: TBeamConfig;
Begin
      InCfg := Default(TBeamConfig);
      InCfg.Profile        := bdCustom;
      InCfg.BeamWidth      := -5;
      InCfg.LocalBeamWidth := 9999;
      InCfg.MaxDepth       := 0;
      InCfg.NodeBudget     := 0;
      InCfg.TimeBudgetMs   := 5000;

      OutCfg := ValidateBeamConfig(InCfg);

      AssertEquals('BeamWidth clamp', 1, OutCfg.BeamWidth);
      AssertEquals('LocalBeamWidth clamp', 1, OutCfg.LocalBeamWidth);
      AssertEquals('MaxDepth clamp', 1, OutCfg.MaxDepth);
      AssertEquals('NodeBudget lower clamp', 1, OutCfg.NodeBudget);
      AssertEquals('TimeBudget clamp', 1000, OutCfg.TimeBudgetMs);
End;

Procedure TBeamSearchTests.TestDedupHitsWithDuplicateStates;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Dec   : TBeamDecision;
Begin
      State  := MakeSimpleState(0, True);
      Config := MakeEasyConfig();
      Config.EnableDedupByHash := True;
      Config.EnableFirstMovePruning := False;
      Config.MaxDepth := 2;
      Config.BeamWidth := 32;
      Config.LocalBeamWidth := 32;
      Config.NodeBudget := 200;
      Plans := Nil;

      Dec := RunBeamSearch(State, 0, Config, Plans, MakeRng());

      AssertFalse('Must not fallback', Dec.Debug.FallbackUsed);
      AssertTrue('Dedup should detect duplicates', Dec.Debug.DedupHits > 0);
End;

Procedure TBeamSearchTests.TestLocalBeamDropsWhenLocalWidthIsOne;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Dec   : TBeamDecision;
Begin
      State  := MakeSimpleState(0, True);
      Config := MakeEasyConfig();
      Config.EnableDedupByHash := False;
      Config.EnableFirstMovePruning := False;
      Config.MaxDepth := 2;
      Config.BeamWidth := 64;
      Config.LocalBeamWidth := 1;
      Config.NodeBudget := 200;
      Plans := Nil;

      Dec := RunBeamSearch(State, 0, Config, Plans, MakeRng());

      AssertFalse('Must not fallback', Dec.Debug.FallbackUsed);
      AssertTrue('Local beam should drop entries', Dec.Debug.LocalBeamDrops > 0);
End;

Procedure TBeamSearchTests.TestKillRiskPruningMetric;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Dec   : TBeamDecision;
      SelfTile: Integer;
Begin
      State := MakeSimpleState(0, True);
      SelfTile := State.Self.TileY * FW + State.Self.TileX;
      State.TileBlocked[SelfTile] := True; // mark current tile as dangerous

      Config := MakeEasyConfig();
      Config.EnableFirstMovePruning := True;
      Config.NodeBudget := 200;
      Plans := Nil;

      Dec := RunBeamSearch(State, 0, Config, Plans, MakeRng());

      AssertFalse('Must still find a non-idle candidate', Dec.Debug.FallbackUsed);
      AssertTrue('Kill-risk pruning should trigger', Dec.Debug.PrunedByKillRisk > 0);
End;

Procedure TBeamSearchTests.TestNodeBudgetZeroUsesFallback;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      Dec   : TBeamDecision;
Begin
      State  := MakeSimpleState(0, True);
      Config := MakeEasyConfig();
      Config.NodeBudget := 0;
      Plans := Nil;

      Dec := RunBeamSearch(State, 0, Config, Plans, MakeRng());

      AssertTrue('Budget zero must fallback', Dec.Debug.FallbackUsed);
      AssertEquals('Neutral action', Ord(baNone), Ord(Dec.Command.Action));
      AssertEquals('Neutral move', Ord(bmNone), Ord(Dec.Command.Move));
End;

Procedure TBeamSearchTests.TestDeterminismWithSameSeed;
Var
      State : TBeamInputState;
      Config: TBeamConfig;
      Plans : TPredictedOpponentPlanArray;
      A, B  : TBeamDecision;
Begin
      State  := MakeSimpleState(0, True);
      Config := MakeEasyConfig();
      Config.RandomTieBreakerSeed := 777;
      Plans := Nil;

      A := RunBeamSearch(State, 0, Config, Plans, TLcgRandom.Create(Config.RandomTieBreakerSeed));
      B := RunBeamSearch(State, 0, Config, Plans, TLcgRandom.Create(Config.RandomTieBreakerSeed));

      AssertFalse('A must not fallback', A.Debug.FallbackUsed);
      AssertFalse('B must not fallback', B.Debug.FallbackUsed);
      AssertEquals('Deterministic action', Ord(A.Command.Action), Ord(B.Command.Action));
      AssertEquals('Deterministic move', Ord(A.Command.Move), Ord(B.Command.Move));
End;

Procedure TBeamSearchTests.TestStratWeightZeroNeverRolls;
Var
      Rng: IRandom;
      I  : Integer;
Begin
      Rng := TLcgRandom.Create(1);
      For I := 1 To 200 Do
            AssertFalse('Weight=0 must never roll True', RollStrategyWeight(0, Rng));
End;

Procedure TBeamSearchTests.TestStratWeightHundredAlwaysRolls;
Var
      Rng: IRandom;
      I  : Integer;
Begin
      Rng := TLcgRandom.Create(1);
      For I := 1 To 200 Do
            AssertTrue('Weight=100 must always roll True', RollStrategyWeight(100, Rng));
End;

Procedure TBeamSearchTests.TestStratWeightFiftyIsProbabilistic;
Var
      Rng         : IRandom;
      I           : Integer;
      TrueCount   : Integer;
      FalseCount  : Integer;
Begin
      Rng        := TLcgRandom.Create(42);
      TrueCount  := 0;
      FalseCount := 0;
      For I := 1 To 200 Do
      Begin
            If RollStrategyWeight(50, Rng) Then
                  Inc(TrueCount)
            Else
                  Inc(FalseCount);
      End;
      AssertTrue('Weight=50 should produce True at least once', TrueCount > 0);
      AssertTrue('Weight=50 should produce False at least once', FalseCount > 0);
End;

Initialization
      RegisterTest(TBeamSearchTests);

End.
