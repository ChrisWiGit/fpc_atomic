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
Unit test_uai_adapter_mapping;

{$MODE ObjFPC}{$H+}

Interface

Uses
      Classes,
      SysUtils,
      fpcunit,
      testregistry,
      uai_types,
      ubeam_types,
      uai_adapter;

Type
      TAdapterMappingTests = Class(TTestCase)
      private
            Procedure InitDefaultAiInfo(Out Info: TAiInfo);
      published
            Procedure MapsPlayerPositionAndTileData;
            Procedure MarksBombTilesAsBlocked;
            Procedure InvalidPlayerBuildsFallbackState;
      End;

Implementation

Procedure TAdapterMappingTests.InitDefaultAiInfo(Out Info: TAiInfo);
Var
      X: Integer;
      Y: Integer;
      I: Integer;
Begin
      Info.Teamplay := True;

      For X := 0 To 14 Do
      Begin
            For Y := 0 To 10 Do
            Begin
                  Info.Field[X, Y] := fBlank;
            End;
      End;

      For I := 0 To High(Info.PlayerInfos) Do
      Begin
            Info.PlayerInfos[I].Team := I Mod 2;
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

      Info.PlayerInfos[0].Position.x := 7.2;
      Info.PlayerInfos[0].Position.y := 4.9;
      Info.PlayerInfos[0].Alive := True;
      Info.PlayerInfos[0].Abilities := Ability_CanKick Or Ability_CanTrigger;

      Info.BombsCount := 0;
      SetLength(Info.Bombs, 0);
End;

Procedure TAdapterMappingTests.MapsPlayerPositionAndTileData;
Var
      Info: TAiInfo;
      AgentState: TAgentState;
      BeamState: TBeamInputState;
Begin
      InitDefaultAiInfo(Info);
      AgentState := BuildAgentState(Info, 0, 80);
      BeamState := BuildBeamInputState(Info, AgentState);

      AssertFalse('Mapping should not fallback on valid player.', BeamState.HasFallbackState);
      AssertEquals('Focus player must match source index.', 0, BeamState.FocusPlayerIndex);
      AssertEquals('Teamplay flag must be mapped.', True, BeamState.Teamplay);
      AssertEquals('Tile X must match truncated position.', 7, BeamState.Self.TileX);
      AssertEquals('Tile Y must match truncated position.', 4, BeamState.Self.TileY);
      AssertTrue('Distance to center must be non-negative.', BeamState.Self.DistanceToCenter >= 0.0);
      AssertEquals('Kick ability must be normalized.', True, BeamState.Self.Capabilities.CanKick);
      AssertEquals('Trigger ability must be normalized.', True, BeamState.Self.Capabilities.CanTrigger);
      AssertEquals('Field array size must be width*height.', 165, Length(BeamState.FieldKinds));
      AssertEquals('Raw tile array size must be width*height.', 165, Length(BeamState.TileRawIds));
End;

Procedure TAdapterMappingTests.MarksBombTilesAsBlocked;
Var
      Info: TAiInfo;
      AgentState: TAgentState;
      BeamState: TBeamInputState;
      TileIndex: Integer;
Begin
      InitDefaultAiInfo(Info);
      Info.BombsCount := 1;
      SetLength(Info.Bombs, 1);
      Info.Bombs[0].Position.x := 6.5;
      Info.Bombs[0].Position.y := 3.5;
      Info.Bombs[0].FlameLength := 4;
      Info.Bombs[0].Owner := 0;
      Info.Bombs[0].Flying := False;
      Info.Bombs[0].ManualTrigger := True;
      Info.Bombs[0].Jelly := False;
      Info.Bombs[0].DudBomb := False;
      Info.Bombs[0].LifeTime := 700;

      AgentState := BuildAgentState(Info, 0, 80);
      BeamState := BuildBeamInputState(Info, AgentState);

      TileIndex := 3 * BeamState.FieldWidth + 6;
      AssertEquals('Bomb tile must be blocked.', True, BeamState.TileBlocked[TileIndex]);
      AssertEquals('Bomb tile X must be normalized.', 6, BeamState.Bombs[0].TileX);
      AssertEquals('Bomb tile Y must be normalized.', 3, BeamState.Bombs[0].TileY);
      AssertEquals('Bomb manual trigger flag must be mapped.', True, BeamState.Bombs[0].ManualTrigger);
      AssertEquals('Bomb lifetime must be mapped.', 700, BeamState.Bombs[0].LifeTimeMs);
End;

Procedure TAdapterMappingTests.InvalidPlayerBuildsFallbackState;
Var
      Info: TAiInfo;
      AgentState: TAgentState;
      BeamState: TBeamInputState;
Begin
      InitDefaultAiInfo(Info);

      AgentState.PlayerIndex := 99;
      AgentState.Strength := 10;
      AgentState.Position.x := 0.5;
      AgentState.Position.y := 0.5;

      BeamState := BuildBeamInputState(Info, AgentState);

      AssertTrue('Invalid player index must return fallback state.', BeamState.HasFallbackState);
      AssertEquals('Fallback keeps requested focus index.', 99, BeamState.FocusPlayerIndex);
      AssertEquals('Fallback should provide empty players list.', 0, Length(BeamState.Players));
End;

Initialization
      RegisterTest(TAdapterMappingTests);

End.
