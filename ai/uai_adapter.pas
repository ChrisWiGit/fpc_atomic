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
Unit uai_adapter;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ctypes,
      uai_types,
      ubeam_types;

Type
      TInternalFieldKind = (
            ifkBlocked,
            ifkNeutral,
            ifkGood,
            ifkBad
      );

      TPlayerCapabilities = Record
            CanKick: Boolean;
            CanSpooger: Boolean;
            CanPunch: Boolean;
            CanGrab: Boolean;
            CanTrigger: Boolean;
            CanJelly: Boolean;
      End;

      TAgentState = Record
            PlayerIndex: Integer;
            Strength: Integer;
            Position: TAiVector2;
            Capabilities: TPlayerCapabilities;
            HasAnyGoodPowerupTile: Boolean;
            HasAnyBadTile: Boolean;
            FieldKinds: Array[0..14, 0..10] Of TInternalFieldKind;
      End;

Function BuildAgentState(Const AiInfo: TAiInfo; PlayerIndex: Integer; Strength: Integer): TAgentState;
Function BuildBeamInputState(Const AiInfo: TAiInfo; Const State: TAgentState): TBeamInputState;
Function MapBeamCommandToAiCommand(Const Command: TBeamCommand): TAiCommand;

Implementation

Uses
      Math;

Const
      BeamFieldWidth = 15;
      BeamFieldHeight = 11;

Function IsGoodPowerup(Field: TAiField): Boolean;
Begin
      Result := Field In [
            fExtraBomb,
            fLongerFlame,
            fGoldflame,
            fExtraSpeed,
            fKick,
            fSpooger,
            fPunch,
            fGrab,
            fTrigger,
            fJelly
      ];
End;

Function IsBadTile(Field: TAiField): Boolean;
Begin
      Result := Field In [fRandom, fSlow, fDisease, fBadDisease];
End;

Function IsBlockedTile(Field: TAiField): Boolean;
Begin
      Result := Field In [fBrick, fSolid];
End;

Function ResolveFieldKind(Field: TAiField): TInternalFieldKind;
Begin
      If IsBlockedTile(Field) Then
      Begin
            Exit(ifkBlocked);
      End;

      If IsGoodPowerup(Field) Then
      Begin
            Exit(ifkGood);
      End;

      If IsBadTile(Field) Then
      Begin
            Exit(ifkBad);
      End;

      Result := ifkNeutral;
End;

Procedure PopulateCapabilities(Var Capabilities: TPlayerCapabilities; Abilities: cuint32);
Begin
      Capabilities.CanKick := (Abilities And Ability_CanKick) <> 0;
      Capabilities.CanSpooger := (Abilities And Ability_CanSpoog) <> 0;
      Capabilities.CanPunch := (Abilities And Ability_CanPunch) <> 0;
      Capabilities.CanGrab := (Abilities And Ability_CanGrab) <> 0;
      Capabilities.CanTrigger := (Abilities And Ability_CanTrigger) <> 0;
      Capabilities.CanJelly := (Abilities And Ability_CanJelly) <> 0;
End;

Function BuildAgentState(Const AiInfo: TAiInfo; PlayerIndex: Integer; Strength: Integer): TAgentState;
Var
      X: Integer;
      Y: Integer;
      Kind: TInternalFieldKind;
Begin
      Result.PlayerIndex := PlayerIndex;
      Result.Strength := Strength;
      Result.Position := AiInfo.PlayerInfos[PlayerIndex].Position;
      Result.HasAnyGoodPowerupTile := False;
      Result.HasAnyBadTile := False;

      PopulateCapabilities(Result.Capabilities, AiInfo.PlayerInfos[PlayerIndex].Abilities);

      For X := 0 To 14 Do
      Begin
            For Y := 0 To 10 Do
            Begin
                  Kind := ResolveFieldKind(AiInfo.Field[X, Y]);
                  Result.FieldKinds[X, Y] := Kind;

                  If Kind = ifkGood Then
                  Begin
                        Result.HasAnyGoodPowerupTile := True;
                  End;

                  If Kind = ifkBad Then
                  Begin
                        Result.HasAnyBadTile := True;
                  End;
            End;
      End;
End;

Function MapFieldKindToBeam(FieldKind: TInternalFieldKind): TBeamTileKind;
Begin
      Case FieldKind Of
            ifkBlocked: Result := btBlocked;
            ifkNeutral: Result := btNeutral;
            ifkGood: Result := btGood;
            ifkBad: Result := btBad;
      Else
            Result := btUnknown;
      End;
End;

Function Clamp(Value: Integer; MinValue: Integer; MaxValue: Integer): Integer;
Begin
      If Value < MinValue Then
      Begin
            Exit(MinValue);
      End;

      If Value > MaxValue Then
      Begin
            Exit(MaxValue);
      End;

      Result := Value;
End;

Function ToTile(Value: Single; MaxExclusive: Integer): Integer;
Begin
      Result := Clamp(Trunc(Value), 0, MaxExclusive - 1);
End;

Function IsInsideTile(X: Integer; Y: Integer): Boolean;
Begin
      Result := (X >= 0) And (Y >= 0) And (X < BeamFieldWidth) And (Y < BeamFieldHeight);
End;

Function GetNeighborKind(Const State: TAgentState; X: Integer; Y: Integer): TBeamTileKind;
Begin
      If Not IsInsideTile(X, Y) Then
      Begin
            Exit(btBlocked);
      End;

      Result := MapFieldKindToBeam(State.FieldKinds[X, Y]);
End;

Function BuildFallbackBeamState(PlayerIndex: Integer): TBeamInputState;
Begin
      Result.FieldWidth := BeamFieldWidth;
      Result.FieldHeight := BeamFieldHeight;
      Result.FocusPlayerIndex := PlayerIndex;
      Result.Teamplay := False;
      Result.HasFallbackState := True;
      Result.Self.PlayerIndex := PlayerIndex;
      Result.Self.MoveDirection := bmdUnknown;
      SetLength(Result.Players, 0);
      SetLength(Result.Bombs, 0);
      SetLength(Result.FieldKinds, 0);
      SetLength(Result.TileBlocked, 0);
      SetLength(Result.TileRawIds, 0);
End;

Procedure MapCapabilitiesToBeam(Const Source: TPlayerCapabilities; Var Target: TBeamPlayerCapabilities);
Begin
      Target.CanKick := Source.CanKick;
      Target.CanSpooger := Source.CanSpooger;
      Target.CanPunch := Source.CanPunch;
      Target.CanGrab := Source.CanGrab;
      Target.CanTrigger := Source.CanTrigger;
      Target.CanJelly := Source.CanJelly;
End;

Function BuildPlayerCapabilities(Abilities: cuint32): TPlayerCapabilities;
Begin
      PopulateCapabilities(Result, Abilities);
End;

Function BuildBeamInputState(Const AiInfo: TAiInfo; Const State: TAgentState): TBeamInputState;
Var
      X: Integer;
      Y: Integer;
      I: Integer;
      FieldIndex: Integer;
      TileX: Integer;
      TileY: Integer;
Begin
      If (State.PlayerIndex < 0) Or (State.PlayerIndex > High(AiInfo.PlayerInfos)) Then
      Begin
            Exit(BuildFallbackBeamState(State.PlayerIndex));
      End;

      Result.FieldWidth := BeamFieldWidth;
      Result.FieldHeight := BeamFieldHeight;
      Result.FocusPlayerIndex := State.PlayerIndex;
      Result.Teamplay := AiInfo.Teamplay;
      Result.HasFallbackState := False;

      Result.Self.PlayerIndex := State.PlayerIndex;
      Result.Self.Position.X := State.Position.X;
      Result.Self.Position.Y := State.Position.Y;
      Result.Self.TileX := ToTile(State.Position.X, BeamFieldWidth);
      Result.Self.TileY := ToTile(State.Position.Y, BeamFieldHeight);
      Result.Self.OffsetToCenterX := State.Position.X - (Result.Self.TileX + 0.5);
      Result.Self.OffsetToCenterY := State.Position.Y - (Result.Self.TileY + 0.5);
      Result.Self.DistanceToCenter := Sqrt(
            Sqr(Result.Self.OffsetToCenterX) + Sqr(Result.Self.OffsetToCenterY)
      );
      Result.Self.MoveDirection := bmdUnknown;
      Result.Self.Alive := AiInfo.PlayerInfos[State.PlayerIndex].Alive;
      Result.Self.Flying := AiInfo.PlayerInfos[State.PlayerIndex].Flying;
      Result.Self.Team := AiInfo.PlayerInfos[State.PlayerIndex].Team;
      MapCapabilitiesToBeam(State.Capabilities, Result.Self.Capabilities);
      Result.Self.NeighborLeft := GetNeighborKind(State, Result.Self.TileX - 1, Result.Self.TileY);
      Result.Self.NeighborRight := GetNeighborKind(State, Result.Self.TileX + 1, Result.Self.TileY);
      Result.Self.NeighborUp := GetNeighborKind(State, Result.Self.TileX, Result.Self.TileY - 1);
      Result.Self.NeighborDown := GetNeighborKind(State, Result.Self.TileX, Result.Self.TileY + 1);

      SetLength(Result.FieldKinds, Result.FieldWidth * Result.FieldHeight);
      SetLength(Result.TileBlocked, Result.FieldWidth * Result.FieldHeight);
      SetLength(Result.TileRawIds, Result.FieldWidth * Result.FieldHeight);
      For Y := 0 To Result.FieldHeight - 1 Do
      Begin
            For X := 0 To Result.FieldWidth - 1 Do
            Begin
                  FieldIndex := Y * Result.FieldWidth + X;
                  Result.FieldKinds[FieldIndex] := MapFieldKindToBeam(State.FieldKinds[X, Y]);
                  Result.TileBlocked[FieldIndex] := State.FieldKinds[X, Y] = ifkBlocked;
                  Result.TileRawIds[FieldIndex] := Ord(AiInfo.Field[X, Y]);
            End;
      End;

      SetLength(Result.Players, Length(AiInfo.PlayerInfos));
      For I := 0 To High(AiInfo.PlayerInfos) Do
      Begin
            Result.Players[I].PlayerIndex := I;
            Result.Players[I].Position.X := AiInfo.PlayerInfos[I].Position.X;
            Result.Players[I].Position.Y := AiInfo.PlayerInfos[I].Position.Y;
            Result.Players[I].TileX := ToTile(AiInfo.PlayerInfos[I].Position.X, BeamFieldWidth);
            Result.Players[I].TileY := ToTile(AiInfo.PlayerInfos[I].Position.Y, BeamFieldHeight);
            Result.Players[I].OffsetToCenterX := Result.Players[I].Position.X - (Result.Players[I].TileX + 0.5);
            Result.Players[I].OffsetToCenterY := Result.Players[I].Position.Y - (Result.Players[I].TileY + 0.5);
            Result.Players[I].DistanceToCenter := Sqrt(
                  Sqr(Result.Players[I].OffsetToCenterX) + Sqr(Result.Players[I].OffsetToCenterY)
            );
            Result.Players[I].MoveDirection := bmdUnknown;
            Result.Players[I].Alive := AiInfo.PlayerInfos[I].Alive;
            Result.Players[I].Flying := AiInfo.PlayerInfos[I].Flying;
            Result.Players[I].Team := AiInfo.PlayerInfos[I].Team;
            MapCapabilitiesToBeam(
                  BuildPlayerCapabilities(AiInfo.PlayerInfos[I].Abilities),
                  Result.Players[I].Capabilities
            );
            Result.Players[I].NeighborLeft := GetNeighborKind(State, Result.Players[I].TileX - 1, Result.Players[I].TileY);
            Result.Players[I].NeighborRight := GetNeighborKind(State, Result.Players[I].TileX + 1, Result.Players[I].TileY);
            Result.Players[I].NeighborUp := GetNeighborKind(State, Result.Players[I].TileX, Result.Players[I].TileY - 1);
            Result.Players[I].NeighborDown := GetNeighborKind(State, Result.Players[I].TileX, Result.Players[I].TileY + 1);
      End;

      SetLength(Result.Bombs, AiInfo.BombsCount);
      For I := 0 To AiInfo.BombsCount - 1 Do
      Begin
            Result.Bombs[I].Position.X := AiInfo.Bombs[I].Position.X;
            Result.Bombs[I].Position.Y := AiInfo.Bombs[I].Position.Y;
            TileX := Trunc(AiInfo.Bombs[I].Position.X);
            TileY := Trunc(AiInfo.Bombs[I].Position.Y);
            Result.Bombs[I].OutOfBounds := Not IsInsideTile(TileX, TileY);
            If Result.Bombs[I].OutOfBounds Then
            Begin
                  Result.Bombs[I].TileX := Clamp(TileX, 0, BeamFieldWidth - 1);
                  Result.Bombs[I].TileY := Clamp(TileY, 0, BeamFieldHeight - 1);
            End
            Else
            Begin
                  Result.Bombs[I].TileX := TileX;
                  Result.Bombs[I].TileY := TileY;
                  FieldIndex := TileY * Result.FieldWidth + TileX;
                  Result.TileBlocked[FieldIndex] := True;
            End;
            Result.Bombs[I].FlameLength := AiInfo.Bombs[I].FlameLength;
            Result.Bombs[I].Owner := AiInfo.Bombs[I].Owner;
            Result.Bombs[I].Flying := AiInfo.Bombs[I].Flying;
            Result.Bombs[I].ManualTrigger := AiInfo.Bombs[I].ManualTrigger;
            Result.Bombs[I].Jelly := AiInfo.Bombs[I].Jelly;
            Result.Bombs[I].DudBomb := AiInfo.Bombs[I].DudBomb;
            Result.Bombs[I].LifeTimeMs := AiInfo.Bombs[I].LifeTime;
      End;
End;

Function MapBeamCommandToAiCommand(Const Command: TBeamCommand): TAiCommand;
Begin
      Case Command.Action Of
            baNone: Result.Action := apNone;
            baFirst: Result.Action := apFirst;
            baFirstDouble: Result.Action := apFirstDouble;
            baSecond: Result.Action := apSecond;
            baSecondDouble: Result.Action := apSecondDouble;
      End;

      Case Command.Move Of
            bmNone: Result.MoveState := amNone;
            bmLeft: Result.MoveState := amLeft;
            bmRight: Result.MoveState := amRight;
            bmUp: Result.MoveState := amUp;
            bmDown: Result.MoveState := amDown;
      End;
End;

End.
