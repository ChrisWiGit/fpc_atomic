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
Unit test_dll_contract_exports;

{$MODE ObjFPC}{$H+}

Interface

Uses
      Classes,
      SysUtils,
      fpcunit,
      testregistry,
      Dynlibs,
      ctypes,
      uai_types;

Type
      TAiInit = Function(): cBool; cdecl;
      TAiDeInit = Procedure(); cdecl;
      TAiInterfaceVersion = Function(): cuint32; cdecl;
      TAiVersion = Function(): PChar; cdecl;
      TAiNewRound = Procedure(Strength: cuint8); cdecl;
      TAiHandlePlayer = Function(PlayerIndex: cuint32; Var AiInfo: TAiInfo): TAiCommand; cdecl;

      TDllContractTests = Class(TTestCase)
      private
            fLib: TLibHandle;
            fAiInit: TAiInit;
            fAiDeInit: TAiDeInit;
            fAiInterfaceVersion: TAiInterfaceVersion;
            fAiVersion: TAiVersion;
            fAiNewRound: TAiNewRound;
            fAiHandlePlayer: TAiHandlePlayer;
            Procedure InitDefaultAiInfo(Out Info: TAiInfo; AlivePlayer0: Boolean);
            Procedure AssertCommandCompatible(Const Command: TAiCommand);
      protected
            Procedure SetUp; override;
            Procedure TearDown; override;
      published
            Procedure InterfaceVersionMatchesContract;
            Procedure VersionIsNonEmpty;
            Procedure InitAndDeInitDoNotCrash;
            Procedure NewRoundAcceptsAllStrengths;
            Procedure HandlePlayerWithMinimalValidState;
            Procedure HandlePlayerWithAllPlayersDead;
            Procedure HandlePlayerRepeatedCallsStayCompatible;
            Procedure DoubleDeInitDoesNotCrash;
      End;

Implementation

Function DllPathInTestsDir(): String;
Begin
{$IFDEF Windows}
      Result := '..\\ai.dll';
{$ELSE}
      Result := '../libai.so';
{$ENDIF}
End;

Procedure TDllContractTests.InitDefaultAiInfo(Out Info: TAiInfo; AlivePlayer0: Boolean);
Var
      X, Y, I: Integer;
Begin
      FillChar(Info, SizeOf(Info), 0);
      Info.Teamplay := False;

      For X := 0 To 14 Do
      Begin
            For Y := 0 To 10 Do
            Begin
                  Info.Field[X, Y] := fBlank;
            End;
      End;

      For I := 0 To High(Info.PlayerInfos) Do
      Begin
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
      End;

      Info.PlayerInfos[0].Position.x := 7.5;
      Info.PlayerInfos[0].Position.y := 5.5;
      Info.PlayerInfos[0].Alive := AlivePlayer0;

      Info.BombsCount := 0;
      SetLength(Info.Bombs, 0);
End;

Procedure TDllContractTests.AssertCommandCompatible(Const Command: TAiCommand);
Begin
      AssertTrue('Action enum must be valid.',
            (Ord(Command.Action) >= Ord(Low(TAiPlayerAction))) And
            (Ord(Command.Action) <= Ord(High(TAiPlayerAction))));

      AssertTrue('Move enum must be valid.',
            (Ord(Command.MoveState) >= Ord(Low(TAiMoveState))) And
            (Ord(Command.MoveState) <= Ord(High(TAiMoveState))));
End;

Procedure TDllContractTests.SetUp;
Begin
      fLib := LoadLibrary(PChar(DllPathInTestsDir()));
      AssertTrue('DLL must be loadable for contract tests.', fLib <> dynlibs.NilHandle);

      Pointer(fAiInit) := GetProcAddress(fLib, 'AiInit');
      Pointer(fAiDeInit) := GetProcAddress(fLib, 'AiDeInit');
      Pointer(fAiInterfaceVersion) := GetProcAddress(fLib, 'AiInterfaceVersion');
      Pointer(fAiVersion) := GetProcAddress(fLib, 'AiVersion');
      Pointer(fAiNewRound) := GetProcAddress(fLib, 'AiNewRound');
      Pointer(fAiHandlePlayer) := GetProcAddress(fLib, 'AiHandlePlayer');

      AssertNotNull('AiInit export missing.', Pointer(fAiInit));
      AssertNotNull('AiDeInit export missing.', Pointer(fAiDeInit));
      AssertNotNull('AiInterfaceVersion export missing.', Pointer(fAiInterfaceVersion));
      AssertNotNull('AiVersion export missing.', Pointer(fAiVersion));
      AssertNotNull('AiNewRound export missing.', Pointer(fAiNewRound));
      AssertNotNull('AiHandlePlayer export missing.', Pointer(fAiHandlePlayer));
End;

Procedure TDllContractTests.TearDown;
Begin
      If fLib <> dynlibs.NilHandle Then
      Begin
            UnloadLibrary(fLib);
            fLib := dynlibs.NilHandle;
      End;
End;

Procedure TDllContractTests.InterfaceVersionMatchesContract;
Begin
      AssertEquals('AiInterfaceVersion must match contract constant.',
            Integer(AiLibInterfaceVersion), Integer(fAiInterfaceVersion()));
End;

Procedure TDllContractTests.VersionIsNonEmpty;
Var
      V: PChar;
Begin
      V := fAiVersion();
      AssertTrue('AiVersion must return a pointer.', V <> Nil);
      AssertTrue('AiVersion string must be non-empty.', Length(String(V)) > 0);
End;

Procedure TDllContractTests.InitAndDeInitDoNotCrash;
Begin
      AssertTrue('AiInit should return true.', fAiInit());
      fAiDeInit();
End;

Procedure TDllContractTests.NewRoundAcceptsAllStrengths;
Var
      S: Integer;
Begin
      AssertTrue('AiInit should return true.', fAiInit());
      Try
            For S := 0 To 100 Do
            Begin
                  fAiNewRound(S);
            End;
      Finally
            fAiDeInit();
      End;
End;

Procedure TDllContractTests.HandlePlayerWithMinimalValidState;
Var
      Info: TAiInfo;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info, True);
      AssertTrue('AiInit should return true.', fAiInit());
      Try
            fAiNewRound(50);
            Command := fAiHandlePlayer(0, Info);
            AssertCommandCompatible(Command);
      Finally
            fAiDeInit();
      End;
End;

Procedure TDllContractTests.HandlePlayerWithAllPlayersDead;
Var
      Info: TAiInfo;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info, False);
      AssertTrue('AiInit should return true.', fAiInit());
      Try
            fAiNewRound(50);
            Command := fAiHandlePlayer(0, Info);
            AssertEquals('Dead player should return neutral action.', Ord(apNone), Ord(Command.Action));
            AssertEquals('Dead player should return neutral move.', Ord(amNone), Ord(Command.MoveState));
      Finally
            fAiDeInit();
      End;
End;

Procedure TDllContractTests.HandlePlayerRepeatedCallsStayCompatible;
Var
      Info: TAiInfo;
      I: Integer;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info, True);
      AssertTrue('AiInit should return true.', fAiInit());
      Try
            fAiNewRound(80);
            For I := 0 To 99 Do
            Begin
                  Command := fAiHandlePlayer(0, Info);
                  AssertCommandCompatible(Command);
            End;
      Finally
            fAiDeInit();
      End;
End;

Procedure TDllContractTests.DoubleDeInitDoesNotCrash;
Begin
      AssertTrue('AiInit should return true.', fAiInit());
      fAiDeInit();
      // Contract requires safe repeated de-initialization.
      fAiDeInit();
End;

Initialization
      RegisterTest(TDllContractTests);

End.
