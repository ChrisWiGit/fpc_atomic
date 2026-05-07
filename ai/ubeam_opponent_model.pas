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
Unit ubeam_opponent_model;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types;

Function BuildDefaultOpponentPlans(Const State: TBeamInputState): TPredictedOpponentPlanArray;

Implementation

Function BuildDefaultOpponentPlans(Const State: TBeamInputState): TPredictedOpponentPlanArray;
Var
      I: Integer;
      Plan: TPredictedOpponentPlan;
      Plans: TPredictedOpponentPlanArray;
Begin
      SetLength(Plans, 0);

      For I := 0 To High(State.Players) Do
      Begin
            If State.Players[I].PlayerIndex = State.FocusPlayerIndex Then
            Begin
                  Continue;
            End;

            Plan.PlayerIndex := State.Players[I].PlayerIndex;
            SetLength(Plan.Actions, 1);
            Plan.Actions[0].Action := baNone;
            Plan.Actions[0].Move := bmNone;

            SetLength(Plans, Length(Plans) + 1);
            Plans[High(Plans)] := Plan;
      End;

      Result := Plans;
End;

End.
