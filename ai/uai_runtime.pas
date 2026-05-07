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
Unit uai_runtime;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ctypes,
      uai_types,
      uai_agent;

Function InitializeAgents(): Boolean;
Procedure FinalizeAgents();
Procedure StartNewRound(Strength: cuint8);
Function HandlePlayerCommand(PlayerIndex: cuint32; Var AiInfo: TAiInfo): TAiCommand;

Implementation

Uses
      uai_safecommand;

Var
      Agents: Array[0..9] Of TAiAgent;

Function IsValidPlayerIndex(PlayerIndex: cuint32): Boolean;
Begin
      Result := PlayerIndex <= High(Agents);
End;

Function InitializeAgents(): Boolean;
Var
      I: Integer;
Begin
      Result := True;

      For I := 0 To High(Agents) Do
      Begin
            If Agents[I] <> Nil Then
            Begin
                  Agents[I].Free();
                  Agents[I] := Nil;
            End;
      End;

      Try
            For I := 0 To High(Agents) Do
            Begin
                  Agents[I] := TAiAgent.CreateForPlayer(I);
            End;
      Except
            FinalizeAgents();
            Result := False;
      End;
End;

Procedure FinalizeAgents();
Var
      I: Integer;
Begin
      For I := 0 To High(Agents) Do
      Begin
            Agents[I].Free();
            Agents[I] := Nil;
      End;
End;

Procedure StartNewRound(Strength: cuint8);
Var
      I: Integer;
Begin
      For I := 0 To High(Agents) Do
      Begin
            If Agents[I] = Nil Then
            Begin
                  Continue;
            End;

            Agents[I].ResetRound(Strength);
      End;
End;

Function HandlePlayerCommand(PlayerIndex: cuint32; Var AiInfo: TAiInfo): TAiCommand;
Begin
      If Not IsValidPlayerIndex(PlayerIndex) Then
      Begin
            Exit(MakeSafeCommand());
      End;

      If Agents[PlayerIndex] = Nil Then
      Begin
            Exit(MakeSafeCommand());
      End;

      Result := Agents[PlayerIndex].HandlePlayer(AiInfo);
End;

End.
