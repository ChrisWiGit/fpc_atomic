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
Unit test_uai_runtime_contract;

{$MODE ObjFPC}{$H+}

Interface

Uses
      Classes,
      SysUtils,
      fpcunit,
      testregistry,
      uai_types,
      uai_runtime;

Type
      TRuntimeContractTests = Class(TTestCase)
      private
            Procedure InitDefaultAiInfo(Out Info: TAiInfo);
      published
            Procedure InvalidIndexReturnsNeutralCommand;
            Procedure ValidIndexReturnsEnumCompatibleCommand;
            Procedure MultipleDeInitDoesNotCrash;
            Procedure HandlePlayerBeforeInitReturnsNeutral;
      End;

Implementation

Procedure TRuntimeContractTests.InitDefaultAiInfo(Out Info: TAiInfo);
Var
      X: Integer;
      Y: Integer;
      I: Integer;
Begin
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
      Info.PlayerInfos[0].Alive := True;

      Info.BombsCount := 0;
      SetLength(Info.Bombs, 0);
End;

Procedure TRuntimeContractTests.InvalidIndexReturnsNeutralCommand;
Var
      Info: TAiInfo;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info);

      InitializeAgents();
      Try
            Command := HandlePlayerCommand(100, Info);
            AssertEquals('Invalid player index must keep action neutral.', Ord(apNone), Ord(Command.Action));
            AssertEquals('Invalid player index must keep movement neutral.', Ord(amNone), Ord(Command.MoveState));
      Finally
            FinalizeAgents();
      End;
End;

Procedure TRuntimeContractTests.ValidIndexReturnsEnumCompatibleCommand;
Var
      Info: TAiInfo;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info);

      InitializeAgents();
      Try
            StartNewRound(50);
            Command := HandlePlayerCommand(0, Info);

            AssertTrue('Action must be a valid TAiPlayerAction enum value.',
                  (Ord(Command.Action) >= Ord(Low(TAiPlayerAction))) And
                  (Ord(Command.Action) <= Ord(High(TAiPlayerAction))));

            AssertTrue('MoveState must be a valid TAiMoveState enum value.',
                  (Ord(Command.MoveState) >= Ord(Low(TAiMoveState))) And
                  (Ord(Command.MoveState) <= Ord(High(TAiMoveState))));
      Finally
            FinalizeAgents();
      End;
End;

Procedure TRuntimeContractTests.MultipleDeInitDoesNotCrash;
Begin
      InitializeAgents();
      FinalizeAgents();
      // Must be idempotent and safe to call repeatedly.
      FinalizeAgents();
End;

Procedure TRuntimeContractTests.HandlePlayerBeforeInitReturnsNeutral;
Var
      Info: TAiInfo;
      Command: TAiCommand;
Begin
      InitDefaultAiInfo(Info);

      // With no active AiInit/InitializeAgents call, runtime must stay safe.
      FinalizeAgents();
      Command := HandlePlayerCommand(0, Info);

      AssertEquals('Uninitialized runtime must keep action neutral.', Ord(apNone), Ord(Command.Action));
      AssertEquals('Uninitialized runtime must keep movement neutral.', Ord(amNone), Ord(Command.MoveState));
End;

Initialization
      RegisterTest(TRuntimeContractTests);

End.
