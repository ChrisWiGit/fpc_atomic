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
Unit uai_planning_core;

{$MODE ObjFPC}{$H+}

Interface

Uses
      uai_types,
      uai_adapter;

Type
      IPlanningCore = Interface
            ['{5E0A1D33-AFCC-4EFB-A9D8-3B2E3E9C6C57}']
            Procedure NewRound(Strength: Integer);
            Function PlanNextCommand(Const State: TAgentState; Const AiInfo: TAiInfo): TAiCommand;
      End;

Function CreatePlanningCore(PlayerIndex: Integer): IPlanningCore;

Implementation

Uses
      uatomicai,
      ubeam_types,
      ubeam_api,
      ubeam_config_profiles,
      uai_safecommand;

Type
      TLegacyPlanningCore = Class(TInterfacedObject, IPlanningCore)
      private
            fLegacyAi: TAtomicAi;
            fBeamConfig: TBeamConfig;
      public
            Class Function CreateForPlayer(PlayerIndex: Integer): IPlanningCore;
            Constructor Create(PlayerIndex: Integer);
            Destructor Destroy(); override;
            Procedure NewRound(Strength: Integer);
            Function PlanNextCommand(Const State: TAgentState; Const AiInfo: TAiInfo): TAiCommand;
      End;

Class Function TLegacyPlanningCore.CreateForPlayer(PlayerIndex: Integer): IPlanningCore;
Begin
      Result := TLegacyPlanningCore.Create(PlayerIndex);
End;

Constructor TLegacyPlanningCore.Create(PlayerIndex: Integer);
Begin
      Inherited Create();
      fLegacyAi := TAtomicAi.Create(PlayerIndex);
      fBeamConfig := BuildBeamConfigFromStrength(100);
End;

Destructor TLegacyPlanningCore.Destroy();
Begin
      fLegacyAi.Free();
      fLegacyAi := Nil;
      Inherited Destroy();
End;

Procedure TLegacyPlanningCore.NewRound(Strength: Integer);
Begin
      fLegacyAi.Reset(Strength);
      fBeamConfig := BuildBeamConfigFromStrength(Strength);
End;

Function TLegacyPlanningCore.PlanNextCommand(Const State: TAgentState; Const AiInfo: TAiInfo): TAiCommand;
Var
      BeamState: TBeamInputState;
      BeamDecision: TBeamDecision;
      EmptyOpponentPlans: TPredictedOpponentPlanArray;
Begin
      If State.PlayerIndex < 0 Then
      Begin
            Exit(MakeSafeCommand());
      End;

      BeamState := BuildBeamInputState(AiInfo, State);
      SetLength(EmptyOpponentPlans, 0);
      Try
            BeamDecision := BeamPlanNextMove(BeamState, State.PlayerIndex, fBeamConfig, EmptyOpponentPlans);
      Except
            Exit(MakeSafeCommand());
      End;

      If BeamDecision.Debug.FallbackUsed Then
      Begin
            Exit(MakeSafeCommand());
      End;

      Result := MapBeamCommandToAiCommand(BeamDecision.Command);
End;

Function CreatePlanningCore(PlayerIndex: Integer): IPlanningCore;
Begin
      Result := TLegacyPlanningCore.CreateForPlayer(PlayerIndex);
End;

End.
