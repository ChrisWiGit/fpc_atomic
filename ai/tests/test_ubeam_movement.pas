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
Unit test_ubeam_movement;

{$MODE ObjFPC}{$H+}

Interface

Uses
      fpcunit,
      testregistry,
      ubeam_types,
      ubeam_move_types,
      ubeam_move_rules,
      ubeam_move_integrator;

Type
      TMovementTests = Class(TTestCase)
      Published
            // 1. Straight movement on an open path
            Procedure TestStraightMoveRight;
            // 2. Turn exactly at tile center
            Procedure TestTurnAtCenter;
            // 3. Epsilon corner rounding stops movement past the diagonal
            Procedure TestEpsilonCornerBlocked;
            // 4. Movement against a direct blocker snaps to tile center
            Procedure TestBlockerSnap;
            // 5. Blocker in a turned direction stops the player
            Procedure TestTurnIntoBlocker;
            // 6. High speed at field boundary clamps to boundary, no WasBlocked
            Procedure TestHighSpeedFieldBoundary;
            // 7. Turn shortly before center is accepted and updates direction
            Procedure TestTurnBeforeCenterChangesDirection;
            // 8. Turn shortly after center is still processed consistently
            Procedure TestTurnAfterCenterDirectionConsistency;
      End;

Implementation

Const
      FW = 15;
      FH = 11;

// Build an all-clear blocked array; optionally mark one tile as blocked.
Function MakeBlocked(BlockedX, BlockedY: Integer): TBeamBooleanArray;
Var
      I: Integer;
Begin
      Result := Nil;
      SetLength(Result, FW * FH);
      For I := 0 To FW * FH - 1 Do
            Result[I] := False;
      If (BlockedX >= 0) And (BlockedX < FW) And
         (BlockedY >= 0) And (BlockedY < FH) Then
            Result[BlockedY * FW + BlockedX] := True;
End;

Function MakeOpenField(): TBeamBooleanArray;
Begin
      Result := MakeBlocked(-1, -1);
End;

// ----------------------------------------------------------------------------

Procedure TMovementTests.TestStraightMoveRight;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player at tile-center (2.5, 2.5), moving right with speed 0.1
      State   := MakeMoveState(2.5, 2.5, 0.1, bmdRight);
      Blocked := MakeOpenField();

      Flags := SimulatePlayerStep(State, bmdUnknown, Blocked, FW, FH);

      // Position advances; tile (3, 2) is clear so no snap
      AssertEquals('X after move right', 2.6, State.Position.X, 1e-5);
      AssertEquals('Y unchanged',        2.5, State.Position.Y, 1e-5);
      AssertFalse('Not blocked',         Flags.WasBlocked);
      AssertFalse('No centering needed', Flags.CenteringApplied);
      AssertFalse('Same tile',           Flags.EnteredNewTile);
End;

Procedure TMovementTests.TestTurnAtCenter;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player at tile-center (2.5, 2.5), direction Right; request turn Down
      State   := MakeMoveState(2.5, 2.5, 0.1, bmdRight);
      Blocked := MakeOpenField();

      // Turn is applied, then move Down
      Flags := SimulatePlayerStep(State, bmdDown, Blocked, FW, FH);

      AssertEquals('Direction after turn', Ord(bmdDown), Ord(State.Direction));
      AssertEquals('X unchanged after turn Down', 2.5, State.Position.X, 1e-5);
      AssertEquals('Y advances after turn Down',  2.6, State.Position.Y, 1e-5);
      AssertFalse('Not blocked', Flags.WasBlocked);
End;

Procedure TMovementTests.TestEpsilonCornerBlocked;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player at (2.5, 2.8): FracY = 0.8 > 0.5 + Epsilon (0.75)
      // Moving right: server checks tile (3, 3) instead of (3, 2) due to epsilon
      // Tile (3, 3) is blocked → player must be stopped
      State   := MakeMoveState(2.5, 2.8, 0.1, bmdRight);
      Blocked := MakeBlocked(3, 3);  // block the epsilon-diagonal tile

      Flags := SimulatePlayerStep(State, bmdUnknown, Blocked, FW, FH);

      AssertTrue('Stopped by epsilon diagonal', Flags.WasBlocked);
      // Snapped back to tile-center X for tile 2
      AssertEquals('Snapped to tile center X', 2.5, State.Position.X, 1e-5);
End;

Procedure TMovementTests.TestBlockerSnap;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player at (2.5, 2.5), moving right; tile (3, 2) is blocked
      State   := MakeMoveState(2.5, 2.5, 0.1, bmdRight);
      Blocked := MakeBlocked(3, 2);

      Flags := SimulatePlayerStep(State, bmdUnknown, Blocked, FW, FH);

      AssertTrue('Blocked by wall', Flags.WasBlocked);
      // Snapped to center of current tile (tile 2 → X = 2.5)
      AssertEquals('X snapped to tile center', 2.5, State.Position.X, 1e-5);
      AssertEquals('Y unchanged', 2.5, State.Position.Y, 1e-5);
End;

Procedure TMovementTests.TestTurnIntoBlocker;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player at (2.5, 2.5), requests turn Down; tile (2, 3) is blocked
      State   := MakeMoveState(2.5, 2.5, 0.1, bmdRight);
      Blocked := MakeBlocked(2, 3);

      // CanTurnTo should return False because the Down tile is blocked
      AssertFalse('CanTurnTo blocked tile', CanTurnTo(State, bmdDown, Blocked, FW, FH));

      // After SimulatePlayerStep, direction still changes but the collision
      // stops the player and snaps Y back to tile center
      Flags := SimulatePlayerStep(State, bmdDown, Blocked, FW, FH);

      AssertEquals('Direction changed', Ord(bmdDown), Ord(State.Direction));
      AssertTrue('Blocked after turn', Flags.WasBlocked);
      AssertEquals('Y snapped to center', 2.5, State.Position.Y, 1e-5);
End;

Procedure TMovementTests.TestHighSpeedFieldBoundary;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Player close to the right edge; high speed would overshoot the boundary
      // FW - 0.5 = 14.5 is the maximum allowed X position
      State   := MakeMoveState(14.4, 5.5, 0.5, bmdRight);
      Blocked := MakeOpenField();

      Flags := SimulatePlayerStep(State, bmdUnknown, Blocked, FW, FH);

      // Position must be clamped to 14.5; field boundary is not a tile blocker
      AssertEquals('X clamped to field boundary', 14.5, State.Position.X, 1e-5);
      AssertFalse('Not a tile blocker', Flags.WasBlocked);
End;

Procedure TMovementTests.TestTurnBeforeCenterChangesDirection;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Slightly before center on X while moving right; turn up should be applied.
      State   := MakeMoveState(2.49, 2.5, 0.1, bmdRight);
      Blocked := MakeOpenField();

      Flags := SimulatePlayerStep(State, bmdUp, Blocked, FW, FH);

      AssertEquals('Direction switched to up', Ord(bmdUp), Ord(State.Direction));
      AssertTrue('Y moved up', State.Position.Y < 2.5);
      AssertFalse('No blocker hit', Flags.WasBlocked);
End;

Procedure TMovementTests.TestTurnAfterCenterDirectionConsistency;
Var
      State  : TBeamMoveState;
      Flags  : TBeamMoveTransitionFlags;
      Blocked: TBeamBooleanArray;
Begin
      // Slightly after center on X while moving right; turning down should still
      // produce a consistent new direction in the simulation step.
      State   := MakeMoveState(2.51, 2.5, 0.1, bmdRight);
      Blocked := MakeOpenField();

      Flags := SimulatePlayerStep(State, bmdDown, Blocked, FW, FH);

      AssertEquals('Direction switched to down', Ord(bmdDown), Ord(State.Direction));
      AssertTrue('Y moved down', State.Position.Y > 2.5);
      AssertFalse('No blocker hit', Flags.WasBlocked);
End;

Initialization
      RegisterTest(TMovementTests);

End.
