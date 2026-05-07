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
Unit ubeam_simulator;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

// Simulated movement distance per beam step (tiles/step). This is an
// abstraction: one beam step covers half a tile so that tactical decisions
// become visible within small search depths.
Const
      BeamSimStepSpeed: Single = 0.5;

// Apply one beam step for the focus player using the given command plus the
// optional opponent plans. Bomb placement and explosion are NOT simulated at
// this stage — only player positions are advanced.
// Depth is used to index into opponent plan action arrays.
Function SimulateNextState(
      Const Current: TBeamInputState;
      FocusCommand: TBeamCommand;
      Const OpponentPlans: TPredictedOpponentPlanArray;
      Depth: Integer
): TBeamInputState;

Implementation

Uses
      Math,
      ubeam_move_types,
      ubeam_move_integrator;

Function MoveToDirection(M: TBeamMove): TBeamMoveDirection;
Begin
      Case M Of
            bmLeft:  Result := bmdLeft;
            bmRight: Result := bmdRight;
            bmUp:    Result := bmdUp;
            bmDown:  Result := bmdDown;
            Else     Result := bmdNone;
      End;
End;

// Advance one player's position in-place using the movement model.
Procedure AdvancePlayer(Var Player: TBeamPlayerState;
                        RequestedDir: TBeamMoveDirection;
                        Const Blocked: TBeamBooleanArray;
                        FW, FH: Integer);
Var
      MS: TBeamMoveState;
Begin
      MS := MakeMoveState(
            Player.Position.X, Player.Position.Y,
            BeamSimStepSpeed,
            Player.MoveDirection
      );
      SimulatePlayerStep(MS, RequestedDir, Blocked, FW, FH);
      Player.Position.X      := MS.Position.X;
      Player.Position.Y      := MS.Position.Y;
      Player.MoveDirection   := MS.Direction;
      Player.TileX           := Trunc(MS.Position.X);
      Player.TileY           := Trunc(MS.Position.Y);
      Player.OffsetToCenterX := MS.Position.X - (Player.TileX + 0.5);
      Player.OffsetToCenterY := MS.Position.Y - (Player.TileY + 0.5);
      Player.DistanceToCenter := Sqrt(
            Player.OffsetToCenterX * Player.OffsetToCenterX +
            Player.OffsetToCenterY * Player.OffsetToCenterY
      );
End;

// Find the opponent plan for a given player index. Returns Nil if none.
Function FindOpponentPlan(
      PlayerIndex: Integer;
      Const Plans: TPredictedOpponentPlanArray
): TBeamCommandArray;
Var
      I: Integer;
Begin
      Result := Nil;
      For I := 0 To High(Plans) Do Begin
            If Integer(Plans[I].PlayerIndex) = PlayerIndex Then Begin
                  Result := Plans[I].Actions;
                  Exit;
            End;
      End;
End;

// Extract the command from a plan for the given simulation depth.
Function GetPlanMove(Const Plan: TBeamCommandArray; Depth: Integer): TBeamMoveDirection;
Begin
      If (Depth >= 0) And (Depth < Length(Plan)) Then
            Result := MoveToDirection(Plan[Depth].Move)
      Else
            Result := bmdNone;
End;

Function SimulateNextState(
      Const Current: TBeamInputState;
      FocusCommand: TBeamCommand;
      Const OpponentPlans: TPredictedOpponentPlanArray;
      Depth: Integer
): TBeamInputState;
Var
      I: Integer;
      OppDir: TBeamMoveDirection;
      OppPlan: TBeamCommandArray;
Begin
      // Start from current state; dynamic array fields are initially shared
      Result := Current;

      // Deep-copy the Players array so we can modify positions without
      // aliasing the current state's data
      SetLength(Result.Players, Length(Current.Players));
      For I := 0 To High(Current.Players) Do
            Result.Players[I] := Current.Players[I];

      // Advance focus player
      If (Current.FocusPlayerIndex >= 0) And
         (Current.FocusPlayerIndex < Length(Result.Players)) And
         Result.Players[Current.FocusPlayerIndex].Alive Then Begin
            AdvancePlayer(
                  Result.Players[Current.FocusPlayerIndex],
                  MoveToDirection(FocusCommand.Move),
                  Current.TileBlocked,
                  Current.FieldWidth, Current.FieldHeight
            );
            // Keep Self in sync with the focused player entry
            Result.Self := Result.Players[Current.FocusPlayerIndex];
      End;

      // Advance opponent players using their predicted plans (or stand still)
      For I := 0 To High(Result.Players) Do Begin
            If I = Current.FocusPlayerIndex Then Continue;
            If Not Result.Players[I].Alive Then Continue;
            OppPlan := FindOpponentPlan(I, OpponentPlans);
            OppDir  := GetPlanMove(OppPlan, Depth);
            AdvancePlayer(
                  Result.Players[I],
                  OppDir,
                  Current.TileBlocked,
                  Current.FieldWidth, Current.FieldHeight
            );
      End;
End;

End.
