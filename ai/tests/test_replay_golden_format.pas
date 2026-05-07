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
Unit test_replay_golden_format;

{$MODE ObjFPC}{$H+}

Interface

Uses
      Classes,
      SysUtils,
      fpcunit,
      testregistry,
      uai_types;

Type
      TReplayGoldenSnapshot = Record
            SnapshotVersion: Integer;
            FocusPlayerIndex: Integer;
            Strength: Integer;
            ExpectedAction: TAiPlayerAction;
            ExpectedMove: TAiMoveState;
      End;

      TReplayGoldenFormatTests = Class(TTestCase)
      private
            Function SnapshotPath(): String;
            Function ParseSnapshotFile(Const Path: String): TReplayGoldenSnapshot;
      published
            Procedure SnapshotFileExists;
            Procedure SnapshotFormatParses;
      End;

Implementation

Function TReplayGoldenFormatTests.SnapshotPath(): String;
Begin
      Result := '.testdata/golden_snapshot_v1.txt';
End;

Function ParseAction(Const S: String): TAiPlayerAction;
Begin
      If S = 'apNone' Then Exit(apNone);
      If S = 'apFirst' Then Exit(apFirst);
      If S = 'apSecond' Then Exit(apSecond);
      If S = 'apFirstDouble' Then Exit(apFirstDouble);
      If S = 'apSecondDouble' Then Exit(apSecondDouble);
      Raise Exception.CreateFmt('Unknown expectedAction: %s', [S]);
End;

Function ParseMove(Const S: String): TAiMoveState;
Begin
      If S = 'amNone' Then Exit(amNone);
      If S = 'amLeft' Then Exit(amLeft);
      If S = 'amRight' Then Exit(amRight);
      If S = 'amUp' Then Exit(amUp);
      If S = 'amDown' Then Exit(amDown);
      Raise Exception.CreateFmt('Unknown expectedMove: %s', [S]);
End;

Function TReplayGoldenFormatTests.ParseSnapshotFile(Const Path: String): TReplayGoldenSnapshot;
Var
      Lines: TStringList;
      I, P: Integer;
      K, V: String;
Begin
      Result := Default(TReplayGoldenSnapshot);
      Lines := TStringList.Create();
      Try
            Lines.LoadFromFile(Path);
            For I := 0 To Lines.Count - 1 Do
            Begin
                  K := Trim(Lines[I]);
                  If (K = '') Or (K[1] = '#') Then
                        Continue;
                  P := Pos('=', K);
                  If P <= 1 Then
                        Continue;

                  V := Trim(Copy(K, P + 1, Length(K)));
                  K := Trim(Copy(K, 1, P - 1));

                  If K = 'snapshotVersion' Then
                        Result.SnapshotVersion := StrToInt(V)
                  Else If K = 'focusPlayerIndex' Then
                        Result.FocusPlayerIndex := StrToInt(V)
                  Else If K = 'strength' Then
                        Result.Strength := StrToInt(V)
                  Else If K = 'expectedAction' Then
                        Result.ExpectedAction := ParseAction(V)
                  Else If K = 'expectedMove' Then
                        Result.ExpectedMove := ParseMove(V);
            End;
      Finally
            Lines.Free();
      End;
End;

Procedure TReplayGoldenFormatTests.SnapshotFileExists;
Begin
      AssertTrue('Golden snapshot sample file must exist.', FileExists(SnapshotPath()));
End;

Procedure TReplayGoldenFormatTests.SnapshotFormatParses;
Var
      S: TReplayGoldenSnapshot;
Begin
      S := ParseSnapshotFile(SnapshotPath());
      AssertEquals('snapshotVersion', 1, S.SnapshotVersion);
      AssertEquals('focusPlayerIndex', 0, S.FocusPlayerIndex);
      AssertEquals('strength', 50, S.Strength);
      AssertEquals('expectedAction', Ord(apNone), Ord(S.ExpectedAction));
      AssertEquals('expectedMove', Ord(amNone), Ord(S.ExpectedMove));
End;

Initialization
      RegisterTest(TReplayGoldenFormatTests);

End.
