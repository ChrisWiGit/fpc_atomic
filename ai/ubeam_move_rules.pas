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
Unit ubeam_move_rules;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types,
      ubeam_move_types;

// True if the tile in the given direction is accessible from the current position.
// Uses the epsilon corridor for diagonal boundary disambiguation, matching the
// server's HandleMovePlayer collision logic.
Function IsDirectionClear(Const State: TBeamMoveState;
                          Dir: TBeamMoveDirection;
                          Const Blocked: TBeamBooleanArray;
                          FW, FH: Integer): Boolean;

// True if turning to NewDir is semantically useful, i.e. the target tile is
// accessible. bmdNone and bmdUnknown always return True.
Function CanTurnTo(Const State: TBeamMoveState;
                   NewDir: TBeamMoveDirection;
                   Const Blocked: TBeamBooleanArray;
                   FW, FH: Integer): Boolean;

Implementation

Function TileIsBlocked(TX, TY, FW, FH: Integer;
                       Const Blocked: TBeamBooleanArray): Boolean;
Begin
      If (TX < 0) Or (TX >= FW) Or (TY < 0) Or (TY >= FH) Then Begin
            Result := True;
            Exit;
      End;
      Result := Blocked[TY * FW + TX];
End;

// Checks whether the adjacent tile in Dir is clear, using the server's epsilon
// diagonal disambiguation: when the perpendicular fractional offset exceeds
// 0.5 + Epsilon, the diagonal neighbor tile is used for the check instead of
// the direct neighbor.
Function CheckAdjacentTile(Const State: TBeamMoveState;
                           Dir: TBeamMoveDirection;
                           Const Blocked: TBeamBooleanArray;
                           FW, FH: Integer): Boolean;
Var
      FracX, FracY: Single;
      TX, TY      : Integer;
Begin
      FracX := State.Position.X - Trunc(State.Position.X);
      FracY := State.Position.Y - Trunc(State.Position.Y);
      TX    := Trunc(State.Position.X);
      TY    := Trunc(State.Position.Y);

      Case Dir Of
            bmdRight: Begin
                  TX := TX + 1;
                  If FracY > 0.5 + BeamMoveEpsilon Then
                        TY := TY + 1;
            End;
            bmdLeft: Begin
                  TX := TX - 1;
                  If FracY > 0.5 + BeamMoveEpsilon Then
                        TY := TY + 1;
            End;
            bmdDown: Begin
                  TY := TY + 1;
                  If FracX > 0.5 + BeamMoveEpsilon Then
                        TX := TX + 1;
            End;
            bmdUp: Begin
                  TY := TY - 1;
                  If FracX > 0.5 + BeamMoveEpsilon Then
                        TX := TX + 1;
            End;
            Else Begin
                  // bmdNone / bmdUnknown: no movement, treat as clear
                  Result := True;
                  Exit;
            End;
      End;

      Result := Not TileIsBlocked(TX, TY, FW, FH, Blocked);
End;

Function IsDirectionClear(Const State: TBeamMoveState;
                          Dir: TBeamMoveDirection;
                          Const Blocked: TBeamBooleanArray;
                          FW, FH: Integer): Boolean;
Begin
      Result := CheckAdjacentTile(State, Dir, Blocked, FW, FH);
End;

Function CanTurnTo(Const State: TBeamMoveState;
                   NewDir: TBeamMoveDirection;
                   Const Blocked: TBeamBooleanArray;
                   FW, FH: Integer): Boolean;
Begin
      If NewDir In [bmdUnknown, bmdNone] Then Begin
            Result := True;
            Exit;
      End;
      Result := CheckAdjacentTile(State, NewDir, Blocked, FW, FH);
End;

End.
