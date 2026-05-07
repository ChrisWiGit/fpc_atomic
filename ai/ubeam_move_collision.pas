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
Unit ubeam_move_collision;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types,
      ubeam_move_types;

// Apply perpendicular centering and resolve blocker collision for the current
// direction. Modifies State.Position in-place to match the server's physics:
//   1. Pull the perpendicular axis toward 0.5 (centering).
//   2. When a tile boundary is about to be crossed, check the target tile.
//      If blocked, snap the primary axis back to the current tile center.
// FracX and FracY must be the fractional parts computed BEFORE centering
// (i.e. immediately after position integration), as the server uses pre-centering
// fractions for both the centering scale and the epsilon diagonal check.
Procedure ResolveMoveCollision(Var State: TBeamMoveState;
                               FracX, FracY: Single;
                               Const Blocked: TBeamBooleanArray;
                               FW, FH: Integer;
                               Var Flags: TBeamMoveTransitionFlags);

Implementation

Function IsTileBlocked(TX, TY, FW, FH: Integer;
                       Const Blocked: TBeamBooleanArray): Boolean;
Begin
      If (TX < 0) Or (TX >= FW) Or (TY < 0) Or (TY >= FH) Then Begin
            Result := True;
            Exit;
      End;
      Result := Blocked[TY * FW + TX];
End;

Procedure ResolveMoveCollision(Var State: TBeamMoveState;
                               FracX, FracY: Single;
                               Const Blocked: TBeamBooleanArray;
                               FW, FH: Integer;
                               Var Flags: TBeamMoveTransitionFlags);
Var
      TX, TY, NX, NY: Integer;
Begin
      TX := Trunc(State.Position.X);
      TY := Trunc(State.Position.Y);

      Case State.Direction Of
            bmdRight: Begin
                  // Centering: pull Y toward tile center, scaled by X-distance from center
                  If FracY <> 0.5 Then Begin
                        State.Position.Y    := State.Position.Y + (0.5 - FracY) * Abs(FracX - 0.5);
                        Flags.CenteringApplied := True;
                  End;
                  // Collision: entering next tile when past X center
                  If FracX > 0.5 Then Begin
                        NX := TX + 1;
                        NY := TY;
                        If FracY > 0.5 + BeamMoveEpsilon Then
                              NY := NY + 1;
                        If IsTileBlocked(NX, NY, FW, FH, Blocked) Then Begin
                              State.Position.X := TX + 0.5;
                              Flags.WasBlocked := True;
                        End;
                  End;
            End;

            bmdLeft: Begin
                  If FracY <> 0.5 Then Begin
                        State.Position.Y    := State.Position.Y + (0.5 - FracY) * Abs(FracX - 0.5);
                        Flags.CenteringApplied := True;
                  End;
                  If FracX < 0.5 Then Begin
                        NX := TX - 1;
                        NY := TY;
                        If FracY > 0.5 + BeamMoveEpsilon Then
                              NY := NY + 1;
                        If IsTileBlocked(NX, NY, FW, FH, Blocked) Then Begin
                              State.Position.X := TX + 0.5;
                              Flags.WasBlocked := True;
                        End;
                  End;
            End;

            bmdDown: Begin
                  If FracX <> 0.5 Then Begin
                        State.Position.X    := State.Position.X + (0.5 - FracX) * Abs(FracY - 0.5);
                        Flags.CenteringApplied := True;
                  End;
                  If FracY > 0.5 Then Begin
                        NX := TX;
                        NY := TY + 1;
                        If FracX > 0.5 + BeamMoveEpsilon Then
                              NX := NX + 1;
                        If IsTileBlocked(NX, NY, FW, FH, Blocked) Then Begin
                              State.Position.Y := TY + 0.5;
                              Flags.WasBlocked := True;
                        End;
                  End;
            End;

            bmdUp: Begin
                  If FracX <> 0.5 Then Begin
                        State.Position.X    := State.Position.X + (0.5 - FracX) * Abs(FracY - 0.5);
                        Flags.CenteringApplied := True;
                  End;
                  If FracY < 0.5 Then Begin
                        NX := TX;
                        NY := TY - 1;
                        If FracX > 0.5 + BeamMoveEpsilon Then
                              NX := NX + 1;
                        If IsTileBlocked(NX, NY, FW, FH, Blocked) Then Begin
                              State.Position.Y := TY + 0.5;
                              Flags.WasBlocked := True;
                        End;
                  End;
            End;
      End;
End;

End.
