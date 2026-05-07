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
Unit uai_safecommand;

{$MODE ObjFPC}{$H+}

Interface

Uses
      uai_types;

Function MakeSafeCommand(): TAiCommand;

Implementation

Function MakeSafeCommand(): TAiCommand;
Begin
      Result.Action := apNone;
      Result.MoveState := amNone;
End;

End.
