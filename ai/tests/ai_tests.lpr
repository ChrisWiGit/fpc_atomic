(******************************************************************************)
(*                                                                            *)
(* Author      : Uwe Schaechterle (Corpsman)                                  *)
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
Program ai_tests;

{$MODE ObjFPC}{$H+}

Uses
  Classes,
  SysUtils,
  fpcunit,
  testregistry,
  consoletestrunner,
  test_uatomicai_basic,
  test_uai_runtime_contract,
  test_ubeam_api_basic,
  test_uai_adapter_mapping,
  test_ubeam_movement,
  test_ubeam_search,
  test_dll_contract_exports,
  test_replay_golden_format;

Var
  Runner: TTestRunner;

Begin
  Runner := TTestRunner.Create(Nil);
  try
    Runner.Initialize;
    Runner.Run;
  finally
    Runner.Free;
  end;
End.
