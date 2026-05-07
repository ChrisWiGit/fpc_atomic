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
Unit uai_agent;

{$MODE ObjFPC}{$H+}

Interface

Uses
      uai_types,
      uai_planning_core;

Type
      TAiAgent = Class
      private
            fPlayerIndex: Integer;
            fStrength: Integer;
            fPlanningCore: IPlanningCore;
      public
            Class Function CreateForPlayer(PlayerIndex: Integer): TAiAgent;
            Constructor Create(PlayerIndex: Integer);
            Procedure ResetRound(Strength: Integer);
            Function HandlePlayer(Var AiInfo: TAiInfo): TAiCommand;
      End;

Implementation

Uses
      SysUtils,
      uai_adapter,
      uai_safecommand;

Class Function TAiAgent.CreateForPlayer(PlayerIndex: Integer): TAiAgent;
Begin
      Result := TAiAgent.Create(PlayerIndex);
End;

Constructor TAiAgent.Create(PlayerIndex: Integer);
Begin
      Inherited Create();
      fPlayerIndex := PlayerIndex;
      fStrength := 100;
      fPlanningCore := CreatePlanningCore(PlayerIndex);
End;

Procedure TAiAgent.ResetRound(Strength: Integer);
Begin
      fStrength := Strength;
      fPlanningCore.NewRound(Strength);
End;

Function TAiAgent.HandlePlayer(Var AiInfo: TAiInfo): TAiCommand;
Var
      AgentState: TAgentState;
Begin
      If (fPlayerIndex < 0) Or (fPlayerIndex > High(AiInfo.PlayerInfos)) Then
      Begin
            Exit(MakeSafeCommand());
      End;

      If Not AiInfo.PlayerInfos[fPlayerIndex].Alive Then
      Begin
            Exit(MakeSafeCommand());
      End;

      AgentState := BuildAgentState(AiInfo, fPlayerIndex, fStrength);

      Try
            Result := fPlanningCore.PlanNextCommand(AgentState, AiInfo);
      Except
            // Runtime safety: planning must never crash the DLL boundary.
            Result := MakeSafeCommand();
      End;
End;

End.
