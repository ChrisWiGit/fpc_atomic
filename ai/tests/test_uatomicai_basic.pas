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
Unit test_uatomicai_basic;

{$MODE ObjFPC}{$H+}

Interface

Uses
  Classes,
  SysUtils,
  fpcunit,
  testregistry,
  uatomicai,
  uai_types;

Type

  { TAtomicAiBasicTests }

  TAtomicAiBasicTests = Class(TTestCase)
  private
    procedure InitDefaultAiInfo(out Info: TAiInfo; PlayerIndex: Integer; Alive: Boolean);
  published
    procedure CreateAndDestroyAi;
    procedure DeadPlayerReturnsIdleCommand;
    procedure AlivePlayerReturnsValidCommand;
  End;

Implementation

procedure TAtomicAiBasicTests.InitDefaultAiInfo(out Info: TAiInfo; PlayerIndex: Integer; Alive: Boolean);
var
  X, Y, I: Integer;
begin
  Info.Teamplay := False;

  for X := 0 to 14 do
  begin
    for Y := 0 to 10 do
    begin
      Info.Field[X, Y] := fBlank;
    end;
  end;

  for I := 0 to High(Info.PlayerInfos) do
  begin
    Info.PlayerInfos[I].Team := 0;
    Info.PlayerInfos[I].Position.x := 0.5;
    Info.PlayerInfos[I].Position.y := 0.5;
    Info.PlayerInfos[I].Alive := False;
    Info.PlayerInfos[I].Flying := False;
    Info.PlayerInfos[I].FlameLength := 2;
    Info.PlayerInfos[I].AvailableBombs := 1;
    Info.PlayerInfos[I].Speed := 1.0;
    Info.PlayerInfos[I].Abilities := 0;
    Info.PlayerInfos[I].IsIll := False;
  end;

  Info.PlayerInfos[PlayerIndex].Position.x := 7.5;
  Info.PlayerInfos[PlayerIndex].Position.y := 5.5;
  Info.PlayerInfos[PlayerIndex].Alive := Alive;

  Info.BombsCount := 0;
  SetLength(Info.Bombs, 0);
end;

procedure TAtomicAiBasicTests.CreateAndDestroyAi;
var
  Ai: TAtomicAi;
begin
  Ai := TAtomicAi.Create(0);
  try
    AssertNotNull('AI instance should be created.', Ai);
  finally
    Ai.Free;
  end;
end;

procedure TAtomicAiBasicTests.DeadPlayerReturnsIdleCommand;
var
  Ai: TAtomicAi;
  Info: TAiInfo;
  Command: TAiCommand;
begin
  InitDefaultAiInfo(Info, 0, False);
  Ai := TAtomicAi.Create(0);
  try
    Command := Ai.CalcAiCommand(Info);
    AssertEquals('Dead player must not perform action.', Ord(apNone), Ord(Command.Action));
    AssertEquals('Dead player must not move.', Ord(amNone), Ord(Command.MoveState));
  finally
    Ai.Free;
  end;
end;

procedure TAtomicAiBasicTests.AlivePlayerReturnsValidCommand;
var
  Ai: TAtomicAi;
  Info: TAiInfo;
  Command: TAiCommand;
begin
  InitDefaultAiInfo(Info, 0, True);
  Ai := TAtomicAi.Create(0);
  try
    Command := Ai.CalcAiCommand(Info);

    AssertTrue('Action must be a valid TAiPlayerAction enum value.',
      (Ord(Command.Action) >= Ord(Low(TAiPlayerAction))) and
      (Ord(Command.Action) <= Ord(High(TAiPlayerAction))));

    AssertTrue('MoveState must be a valid TAiMoveState enum value.',
      (Ord(Command.MoveState) >= Ord(Low(TAiMoveState))) and
      (Ord(Command.MoveState) <= Ord(High(TAiMoveState))));
  finally
    Ai.Free;
  end;
end;

initialization
  RegisterTest(TAtomicAiBasicTests);

End.
