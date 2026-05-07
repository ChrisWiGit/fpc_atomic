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
Unit ubeam_tactical_filters;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

Function PassesFirstMovePruning(Const State: TBeamInputState; Const Command: TBeamCommand; Var Debug: TBeamDebugInfo): Boolean;

Implementation

Function IsInside(TX, TY, FW, FH: Integer): Boolean;
Begin
      Result := (TX >= 0) And (TX < FW) And (TY >= 0) And (TY < FH);
End;

Function IsBombRiskTile(Const State: TBeamInputState; TX, TY: Integer): Boolean;
Begin
      If Not IsInside(TX, TY, State.FieldWidth, State.FieldHeight) Then
      Begin
            Result := False;
            Exit;
      End;
      Result := State.TileBlocked[TY * State.FieldWidth + TX];
End;

Function PassesFirstMovePruning(Const State: TBeamInputState; Const Command: TBeamCommand; Var Debug: TBeamDebugInfo): Boolean;
Var
      TX, TY: Integer;
Begin
      If State.Self.Alive = False Then
      Begin
            Debug.PrunedBySurvivability := Debug.PrunedBySurvivability + 1;
            Exit(False);
      End;

      // Hard kill-risk filter: if current tile is bomb-blocked, staying still
      // and doing nothing is considered an unsafe first move.
      TX := State.Self.TileX;
      TY := State.Self.TileY;
      If IsBombRiskTile(State, TX, TY) And
         (Command.Move = bmNone) And
         (Command.Action = baNone) Then
      Begin
            Debug.PrunedByKillRisk := Debug.PrunedByKillRisk + 1;
            Exit(False);
      End;

      If (Command.Move = bmNone) And (Command.Action = baNone) Then
      Begin
            Result := True;
            Exit;
      End;

      Result := True;
End;

End.
