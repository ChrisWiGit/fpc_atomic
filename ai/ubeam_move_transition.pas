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
Unit ubeam_move_transition;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_move_types;

// Detect whether a tile boundary was crossed by comparing the tile coordinates
// before and after a simulation step. Sets Flags.EnteredNewTile accordingly.
// Tile X/Y are derived as Trunc(Position.X) / Trunc(Position.Y).
Procedure ApplyMoveTransition(Const State: TBeamMoveState;
                              PrevTileX, PrevTileY: Integer;
                              Var Flags: TBeamMoveTransitionFlags);

// Return the tile column for a continuous X coordinate.
Function TileColumn(PosX: Single): Integer;

// Return the tile row for a continuous Y coordinate.
Function TileRow(PosY: Single): Integer;

Implementation

Procedure ApplyMoveTransition(Const State: TBeamMoveState;
                              PrevTileX, PrevTileY: Integer;
                              Var Flags: TBeamMoveTransitionFlags);
Begin
      Flags.EnteredNewTile :=
            (Trunc(State.Position.X) <> PrevTileX) Or
            (Trunc(State.Position.Y) <> PrevTileY);
End;

Function TileColumn(PosX: Single): Integer;
Begin
      Result := Trunc(PosX);
End;

Function TileRow(PosY: Single): Integer;
Begin
      Result := Trunc(PosY);
End;

End.
