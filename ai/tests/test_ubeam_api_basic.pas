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
Unit test_ubeam_api_basic;

{$MODE ObjFPC}{$H+}

Interface

Uses
      Classes,
      SysUtils,
      fpcunit,
      testregistry,
      ubeam_types,
      ubeam_api,
      ubeam_config_profiles;

Type
      TBeamApiBasicTests = Class(TTestCase)
      private
            Function BuildSimpleState(PlayerIndex: Integer): TBeamInputState;
      published
            Procedure EmptyStateUsesFallback;
            Procedure FocusedAlivePlayerProducesDeterministicNeutralDecision;
      End;

Implementation

Function TBeamApiBasicTests.BuildSimpleState(PlayerIndex: Integer): TBeamInputState;
Begin
      Result.FieldWidth := 15;
      Result.FieldHeight := 11;
      Result.FocusPlayerIndex := PlayerIndex;

      Result.Self.PlayerIndex := PlayerIndex;
      Result.Self.Position.X := 7.5;
      Result.Self.Position.Y := 5.5;
      Result.Self.Alive := True;
      Result.Self.Flying := False;
      Result.Self.Team := 0;

      SetLength(Result.Players, 2);
      Result.Players[0] := Result.Self;
      Result.Players[0].PlayerIndex := 0;
      Result.Players[1] := Result.Self;
      Result.Players[1].PlayerIndex := 1;
      Result.Players[1].Alive := False;

      SetLength(Result.Bombs, 0);
      SetLength(Result.FieldKinds, Result.FieldWidth * Result.FieldHeight);
      SetLength(Result.TileBlocked, Result.FieldWidth * Result.FieldHeight);
      SetLength(Result.TileRawIds,  Result.FieldWidth * Result.FieldHeight);
      Result.Teamplay        := False;
      Result.HasFallbackState := False;
      Result.Self.TileX      := Trunc(Result.Self.Position.X);
      Result.Self.TileY      := Trunc(Result.Self.Position.Y);
      Result.Players[0].TileX := Trunc(Result.Players[0].Position.X);
      Result.Players[0].TileY := Trunc(Result.Players[0].Position.Y);
      Result.Players[1].TileX := Trunc(Result.Players[1].Position.X);
      Result.Players[1].TileY := Trunc(Result.Players[1].Position.Y);
End;

Procedure TBeamApiBasicTests.EmptyStateUsesFallback;
Var
      State: TBeamInputState;
      Config: TBeamConfig;
      Decision: TBeamDecision;
      OpponentPlans: TPredictedOpponentPlanArray;
Begin
      FillChar(State, SizeOf(State), 0);
      Config := ValidateBeamConfig(BuildBeamConfigFromStrength(50));
      SetLength(OpponentPlans, 0);

      Decision := BeamPlanNextMove(State, 0, Config, OpponentPlans);

      AssertTrue('Invalid focus should use fallback.', Decision.Debug.FallbackUsed);
      AssertEquals('Fallback should keep action neutral.', Ord(baNone), Ord(Decision.Command.Action));
      AssertEquals('Fallback should keep movement neutral.', Ord(bmNone), Ord(Decision.Command.Move));
End;

Procedure TBeamApiBasicTests.FocusedAlivePlayerProducesDeterministicNeutralDecision;
Var
      State: TBeamInputState;
      Config: TBeamConfig;
      DecisionA: TBeamDecision;
      DecisionB: TBeamDecision;
      OpponentPlans: TPredictedOpponentPlanArray;
Begin
      State := BuildSimpleState(0);
      Config := ValidateBeamConfig(BuildBeamConfigFromStrength(75));
      SetLength(OpponentPlans, 0);

      DecisionA := BeamPlanNextMove(State, 0, Config, OpponentPlans);
      DecisionB := BeamPlanNextMove(State, 0, Config, OpponentPlans);

      AssertFalse('Valid focused state must not use fallback.', DecisionA.Debug.FallbackUsed);
      AssertEquals('Action must be deterministic for identical input.', Ord(DecisionA.Command.Action), Ord(DecisionB.Command.Action));
      AssertEquals('Move must be deterministic for identical input.', Ord(DecisionA.Command.Move), Ord(DecisionB.Command.Move));
End;

Initialization
      RegisterTest(TBeamApiBasicTests);

End.
