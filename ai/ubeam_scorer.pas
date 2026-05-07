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
Unit ubeam_scorer;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

// Evaluate how desirable the given state is for the focus player.
// Priority order: survival (hard) → bomb danger → mobility → positional.
// Returns a large negative value when the focus player is dead.
Function ScoreState(Const State: TBeamInputState): Single;

Implementation

Const
      DeadPenalty         = -10000.0; // hard survival check
      SurvivalBase        =   100.0;  // alive bonus
      MobilityBonusPerTile =   20.0;  // per accessible adjacent tile
      BombOnCurrentTile   =  -200.0;  // standing directly on a bomb
      BombOnAdjacentTile  =   -80.0;  // bomb one tile away

// True when the tile (TX, TY) is in the TileBlocked map.
// Out-of-bounds tiles are treated as not-blocked (no bomb outside the field).
Function IsBombTile(Const State: TBeamInputState; TX, TY: Integer): Boolean;
Begin
      If (TX < 0) Or (TX >= State.FieldWidth) Or
         (TY < 0) Or (TY >= State.FieldHeight) Then Begin
            Result := False;
            Exit;
      End;
      Result := State.TileBlocked[TY * State.FieldWidth + TX];
End;

// Count how many of the 4 cardinal neighbors are accessible (not hard-blocked
// by a wall). Uses FieldKinds which remains static during simulation.
Function CountOpenNeighbors(Const State: TBeamInputState; TX, TY: Integer): Integer;
Var
      Count: Integer;

      Procedure CheckTile(DX, DY: Integer);
      Var
            CX, CY: Integer;
      Begin
            CX := TX + DX;
            CY := TY + DY;
            If (CX < 0) Or (CX >= State.FieldWidth) Or
               (CY < 0) Or (CY >= State.FieldHeight) Then
                  Exit;
            If State.FieldKinds[CY * State.FieldWidth + CX] <> btBlocked Then
                  Inc(Count);
      End;

Begin
      Count := 0;
      CheckTile(-1,  0);
      CheckTile( 1,  0);
      CheckTile( 0, -1);
      CheckTile( 0,  1);
      Result := Count;
End;

Function ScoreState(Const State: TBeamInputState): Single;
Var
      Score: Single;
      FX, FY: Integer;
Begin
      If Not State.Self.Alive Then Begin
            Result := DeadPenalty;
            Exit;
      End;

      Score := SurvivalBase;

      FX := State.Self.TileX;
      FY := State.Self.TileY;

      // Bomb danger: penalize standing on or adjacent to a bomb tile
      If IsBombTile(State, FX,     FY)     Then Score := Score + BombOnCurrentTile;
      If IsBombTile(State, FX - 1, FY)     Then Score := Score + BombOnAdjacentTile;
      If IsBombTile(State, FX + 1, FY)     Then Score := Score + BombOnAdjacentTile;
      If IsBombTile(State, FX,     FY - 1) Then Score := Score + BombOnAdjacentTile;
      If IsBombTile(State, FX,     FY + 1) Then Score := Score + BombOnAdjacentTile;

      // Mobility: prefer open positions with more movement options
      Score := Score + CountOpenNeighbors(State, FX, FY) * MobilityBonusPerTile;

      Result := Score;
End;

End.
