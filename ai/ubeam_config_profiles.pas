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
Unit ubeam_config_profiles;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

Function BuildBeamConfigFromStrength(Strength: Integer): TBeamConfig;
Function ValidateBeamConfig(Const Config: TBeamConfig): TBeamConfig;

Implementation

Function Clamp(Value: Integer; MinValue: Integer; MaxValue: Integer): Integer;
Begin
      If Value < MinValue Then
      Begin
            Exit(MinValue);
      End;

      If Value > MaxValue Then
      Begin
            Exit(MaxValue);
      End;

      Result := Value;
End;

Function ClampByte(Value: Integer): Byte;
Begin
      Result := Byte(Clamp(Value, 0, 100));
End;

Procedure SetAllStratWeights(Var Config: TBeamConfig; W: Byte);
Begin
      Config.StratSafeCorridorWeight    := W;
      Config.StratTriggerTimingWeight   := W;
      Config.StratTrapSetupWeight       := W;
      Config.StratBombChainWeight       := W;
      Config.StratZoneControlWeight     := W;
      Config.StratPhaseTempoWeight      := W;
      Config.StratOpponentProfileWeight := W;
      Config.StratTeamplayWeight        := W;
      Config.StratItemValueWeight       := W;
      Config.StratAntiStallWeight       := W;
      Config.StratRiskBudgetWeight      := W;
      Config.StratTimeBudgetStopWeight  := W;
End;

Function BuildEasyConfig(): TBeamConfig;
Begin
      Result.Profile := bdEasy;
      Result.BeamWidth := 24;
      Result.LocalBeamWidth := 8;
      Result.MaxDepth := 5;
      Result.NodeBudget := 500;
      Result.TimeBudgetMs := 8;
      Result.RandomTieBreakerSeed := 1;
      Result.EnableOpponentPrediction := False;
      Result.EnableFirstMovePruning := False;
      Result.EnableSurvivabilityChecks := True;
      Result.EnableDedupByHash := True;
      SetAllStratWeights(Result, 0);
End;

Function BuildNormalConfig(): TBeamConfig;
Begin
      Result.Profile := bdNormal;
      Result.BeamWidth := 48;
      Result.LocalBeamWidth := 16;
      Result.MaxDepth := 8;
      Result.NodeBudget := 1200;
      Result.TimeBudgetMs := 10;
      Result.RandomTieBreakerSeed := 1;
      Result.EnableOpponentPrediction := True;
      Result.EnableFirstMovePruning := True;
      Result.EnableSurvivabilityChecks := True;
      Result.EnableDedupByHash := True;
      SetAllStratWeights(Result, 50);
End;

Function BuildHardConfig(): TBeamConfig;
Begin
      Result.Profile := bdHard;
      Result.BeamWidth := 80;
      Result.LocalBeamWidth := 24;
      Result.MaxDepth := 11;
      Result.NodeBudget := 2400;
      Result.TimeBudgetMs := 14;
      Result.RandomTieBreakerSeed := 1;
      Result.EnableOpponentPrediction := True;
      Result.EnableFirstMovePruning := True;
      Result.EnableSurvivabilityChecks := True;
      Result.EnableDedupByHash := True;
      SetAllStratWeights(Result, 100);
End;

Function BuildBeamConfigFromStrength(Strength: Integer): TBeamConfig;
Begin
      Strength := Clamp(Strength, 0, 100);

      If Strength <= 33 Then
      Begin
            Exit(BuildEasyConfig());
      End;

      If Strength <= 66 Then
      Begin
            Exit(BuildNormalConfig());
      End;

      Result := BuildHardConfig();
End;

Function ValidateBeamConfig(Const Config: TBeamConfig): TBeamConfig;
Begin
      Result := Config;

      Result.BeamWidth := Clamp(Result.BeamWidth, 1, 512);
      Result.LocalBeamWidth := Clamp(Result.LocalBeamWidth, 1, Result.BeamWidth);
      Result.MaxDepth := Clamp(Result.MaxDepth, 1, 64);
      Result.NodeBudget := Clamp(Result.NodeBudget, Result.BeamWidth, 1000000);
      Result.TimeBudgetMs := Clamp(Result.TimeBudgetMs, 0, 1000);

      Result.StratSafeCorridorWeight    := ClampByte(Result.StratSafeCorridorWeight);
      Result.StratTriggerTimingWeight   := ClampByte(Result.StratTriggerTimingWeight);
      Result.StratTrapSetupWeight       := ClampByte(Result.StratTrapSetupWeight);
      Result.StratBombChainWeight       := ClampByte(Result.StratBombChainWeight);
      Result.StratZoneControlWeight     := ClampByte(Result.StratZoneControlWeight);
      Result.StratPhaseTempoWeight      := ClampByte(Result.StratPhaseTempoWeight);
      Result.StratOpponentProfileWeight := ClampByte(Result.StratOpponentProfileWeight);
      Result.StratTeamplayWeight        := ClampByte(Result.StratTeamplayWeight);
      Result.StratItemValueWeight       := ClampByte(Result.StratItemValueWeight);
      Result.StratAntiStallWeight       := ClampByte(Result.StratAntiStallWeight);
      Result.StratRiskBudgetWeight      := ClampByte(Result.StratRiskBudgetWeight);
      Result.StratTimeBudgetStopWeight  := ClampByte(Result.StratTimeBudgetStopWeight);
End;

End.
