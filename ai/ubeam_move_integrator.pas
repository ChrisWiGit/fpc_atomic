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
Unit ubeam_move_integrator;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types,
      ubeam_move_types;

// Simulate one server frame of movement for a player, following the same
// sequence as TAtomicField.HandleMovePlayer (without conveyors/kick/sounds):
//   1. Apply direction change if requested.
//   2. Advance position in the current direction (clamped to field bounds).
//   3. Apply perpendicular centering and resolve blocker collision.
//   4. Detect tile-boundary crossing.
//
// RequestedDir = bmdUnknown leaves the direction unchanged.
// FW/FH are the field dimensions in tiles.
// Returns flags describing what happened during the step.
Function SimulatePlayerStep(Var State: TBeamMoveState;
                            RequestedDir: TBeamMoveDirection;
                            Const Blocked: TBeamBooleanArray;
                            FW, FH: Integer): TBeamMoveTransitionFlags;

Implementation

Uses
      Math,
      ubeam_move_collision,
      ubeam_move_transition;

Function SimulatePlayerStep(Var State: TBeamMoveState;
                            RequestedDir: TBeamMoveDirection;
                            Const Blocked: TBeamBooleanArray;
                            FW, FH: Integer): TBeamMoveTransitionFlags;
Var
      Flags         : TBeamMoveTransitionFlags;
      PrevTX, PrevTY: Integer;
      FracX, FracY  : Single;
Begin
      Flags.WasBlocked       := False;
      Flags.CenteringApplied := False;
      Flags.EnteredNewTile   := False;

      // Record tile before any movement for transition detection
      PrevTX := Trunc(State.Position.X);
      PrevTY := Trunc(State.Position.Y);

      // Step 1: Apply direction change unconditionally (mirrors server behaviour:
      // MoveState is set by player input without physics restriction)
      If RequestedDir <> bmdUnknown Then
            State.Direction := RequestedDir;

      // Step 2: Integrate position; clamp to field bounds (server uses min/max)
      Case State.Direction Of
            bmdRight: State.Position.X := Min(FW - 0.5, State.Position.X + State.Speed);
            bmdLeft:  State.Position.X := Max(0.5,       State.Position.X - State.Speed);
            bmdDown:  State.Position.Y := Min(FH - 0.5, State.Position.Y + State.Speed);
            bmdUp:    State.Position.Y := Max(0.5,       State.Position.Y - State.Speed);
            Else { bmdNone / bmdUnknown: still, no position change } ;
      End;

      // Step 3: Centering + collision — fractional parts are computed from the
      // integrated (but pre-centering) position, matching the server order
      FracX := State.Position.X - Trunc(State.Position.X);
      FracY := State.Position.Y - Trunc(State.Position.Y);

      If State.Direction In [bmdLeft, bmdRight, bmdDown, bmdUp] Then
            ResolveMoveCollision(State, FracX, FracY, Blocked, FW, FH, Flags);

      // Step 4: Detect tile entry
      ApplyMoveTransition(State, PrevTX, PrevTY, Flags);

      Result := Flags;
End;

End.
