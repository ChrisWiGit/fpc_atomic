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
Unit ubeam_candidates;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

// Generate all candidate commands for the focus player given the current state.
// Always includes bmNone. Directional moves are always included (collision
// resolution will snap if blocked). Actions: baNone always; baFirst (bomb
// place); baSecond (manual trigger) only if the player has CanTrigger.
Function GenerateCandidates(Const State: TBeamInputState): TBeamCommandArray;

Implementation

Procedure AppendCandidate(Var Candidates: TBeamCommandArray;
                          M: TBeamMove; A: TBeamAction);
Var
      N: Integer;
Begin
      N := Length(Candidates);
      SetLength(Candidates, N + 1);
      Candidates[N].Move   := M;
      Candidates[N].Action := A;
End;

Function GenerateCandidates(Const State: TBeamInputState): TBeamCommandArray;
Const
      AllMoves: Array[0..4] Of TBeamMove = (bmNone, bmLeft, bmRight, bmUp, bmDown);
Var
      I: Integer;
      M: TBeamMove;
Begin
      Result := Nil;
      For I := 0 To High(AllMoves) Do Begin
            M := AllMoves[I];
            AppendCandidate(Result, M, baNone);
            AppendCandidate(Result, M, baFirst);
            If State.Self.Capabilities.CanTrigger Then
                  AppendCandidate(Result, M, baSecond);
      End;
End;

End.
