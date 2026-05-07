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
Unit ubeam_api;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

Function BeamPlanNextMove(
      Const State: TBeamInputState;
      PlayerIndex: LongWord;
      Const Config: TBeamConfig;
      Const OpponentPlans: TPredictedOpponentPlanArray
): TBeamDecision;

Implementation

Uses
      ubeam_config_profiles,
      ubeam_opponent_model,
      ubeam_search_core,
      ubeam_irandom;

Function BeamPlanNextMove(
      Const State: TBeamInputState;
      PlayerIndex: LongWord;
      Const Config: TBeamConfig;
      Const OpponentPlans: TPredictedOpponentPlanArray
): TBeamDecision;
Var
      EffectiveConfig: TBeamConfig;
      EffectiveOpponentPlans: TPredictedOpponentPlanArray;
      Rng: IRandom;
Begin
      EffectiveConfig := ValidateBeamConfig(Config);
      EffectiveOpponentPlans := OpponentPlans;

      If EffectiveConfig.EnableOpponentPrediction And (Length(EffectiveOpponentPlans) = 0) Then
      Begin
            EffectiveOpponentPlans := BuildDefaultOpponentPlans(State);
      End;

      Rng := TLcgRandom.Create(EffectiveConfig.RandomTieBreakerSeed);
      Result := RunBeamSearch(
            State, PlayerIndex, EffectiveConfig, EffectiveOpponentPlans, Rng);
End;

End.
