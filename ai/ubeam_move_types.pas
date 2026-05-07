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
Unit ubeam_move_types;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

Const
      // Corner-rounding tolerance matching the server's Epsilon constant.
      // Larger values allow more corner rounding (max 0.5).
      BeamMoveEpsilon = 0.25;

Type
      // Continuous movement state for one player in a beam simulation step.
      // Tile centers are at X.5, Y.5 in the position coordinate system.
      TBeamMoveState = Record
            Position : TBeamVector2;       // continuous position (tile centers at X.5)
            Direction: TBeamMoveDirection; // current movement direction
            Speed    : Single;             // tiles per simulation step
      End;

      // Flags describing what happened during one simulation step.
      TBeamMoveTransitionFlags = Record
            WasBlocked     : Boolean; // movement was stopped by a blocker
            CenteringApplied: Boolean; // perpendicular centering was applied
            EnteredNewTile : Boolean; // player crossed into a different tile
      End;

Function MakeMoveState(PosX, PosY, ASpeed: Single;
                       ADir: TBeamMoveDirection): TBeamMoveState;

Implementation

Function MakeMoveState(PosX, PosY, ASpeed: Single;
                       ADir: TBeamMoveDirection): TBeamMoveState;
Begin
      Result.Position.X := PosX;
      Result.Position.Y := PosY;
      Result.Speed       := ASpeed;
      Result.Direction   := ADir;
End;

End.
