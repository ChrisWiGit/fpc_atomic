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
Unit ubeam_types;

{$MODE ObjFPC}{$H+}

Interface

Type
      TBeamMoveDirection = (
            bmdUnknown,
            bmdNone,
            bmdLeft,
            bmdRight,
            bmdUp,
            bmdDown
      );

      TBeamDifficultyProfile = (
            bdEasy,
            bdNormal,
            bdHard,
            bdCustom
      );

      TBeamAction = (
            baNone,
            baFirst,
            baFirstDouble,
            baSecond,
            baSecondDouble
      );

      TBeamMove = (
            bmNone,
            bmLeft,
            bmRight,
            bmUp,
            bmDown
      );

      TBeamCommand = Record
            Action: TBeamAction;
            Move: TBeamMove;
      End;

      TBeamTileKind = (
            btUnknown,
            btBlocked,
            btNeutral,
            btGood,
            btBad
      );

      TBeamVector2 = Record
            X: Single;
            Y: Single;
      End;

      TBeamPlayerCapabilities = Record
            CanKick: Boolean;
            CanSpooger: Boolean;
            CanPunch: Boolean;
            CanGrab: Boolean;
            CanTrigger: Boolean;
            CanJelly: Boolean;
      End;

      TBeamPlayerState = Record
            PlayerIndex: Integer;
            Position: TBeamVector2;
            TileX: Integer;
            TileY: Integer;
            OffsetToCenterX: Single;
            OffsetToCenterY: Single;
            DistanceToCenter: Single;
            MoveDirection: TBeamMoveDirection;
            Alive: Boolean;
            Flying: Boolean;
            Team: Integer;
            Capabilities: TBeamPlayerCapabilities;
            NeighborLeft: TBeamTileKind;
            NeighborRight: TBeamTileKind;
            NeighborUp: TBeamTileKind;
            NeighborDown: TBeamTileKind;
      End;

      TBeamBombState = Record
            Position: TBeamVector2;
            TileX: Integer;
            TileY: Integer;
            FlameLength: Integer;
            Owner: Integer;
            Flying: Boolean;
            ManualTrigger: Boolean;
            Jelly: Boolean;
            DudBomb: Boolean;
            LifeTimeMs: Integer;
            OutOfBounds: Boolean;
      End;

      TBeamCommandArray = Array Of TBeamCommand;
      TBeamPlayerStateArray = Array Of TBeamPlayerState;
      TBeamBombStateArray = Array Of TBeamBombState;
      TBeamTileKindArray = Array Of TBeamTileKind;
      TBeamBooleanArray = Array Of Boolean;
      TBeamIntegerArray = Array Of Integer;

      TBeamInputState = Record
            FieldWidth: Integer;
            FieldHeight: Integer;
            FocusPlayerIndex: Integer;
            Teamplay: Boolean;
            HasFallbackState: Boolean;
            Self: TBeamPlayerState;
            Players: TBeamPlayerStateArray;
            Bombs: TBeamBombStateArray;
            FieldKinds: TBeamTileKindArray;
            TileBlocked: TBeamBooleanArray;
            TileRawIds: TBeamIntegerArray;
      End;

      TBeamConfig = Record
            Profile: TBeamDifficultyProfile;
            BeamWidth: Integer;
            LocalBeamWidth: Integer;
            MaxDepth: Integer;
            NodeBudget: Integer;
            TimeBudgetMs: Integer;
            RandomTieBreakerSeed: LongWord;
            EnableOpponentPrediction: Boolean;
            EnableFirstMovePruning: Boolean;
            EnableSurvivabilityChecks: Boolean;
            EnableDedupByHash: Boolean;
            // Per-strategy activation weights: 0=never, 100=always, 1-99=probabilistic.
            // Used for AI debugging: isolate or force individual strategies.
            StratSafeCorridorWeight   : Byte; // strat.plan-1
            StratTriggerTimingWeight  : Byte; // strat.plan-1
            StratTrapSetupWeight      : Byte; // strat.plan-2
            StratBombChainWeight      : Byte; // strat.plan-2
            StratZoneControlWeight    : Byte; // strat.plan-3
            StratPhaseTempoWeight     : Byte; // strat.plan-3
            StratOpponentProfileWeight: Byte; // strat.plan-4
            StratTeamplayWeight       : Byte; // strat.plan-4
            StratItemValueWeight      : Byte; // strat.plan-5
            StratAntiStallWeight      : Byte; // strat.plan-5
            StratRiskBudgetWeight     : Byte; // strat.plan-6
            StratTimeBudgetStopWeight : Byte; // strat.plan-6
      End;

      TBeamDebugInfo = Record
            ExpandedNodes: Integer;
            EvaluatedNodes: Integer;
            SelectedDepth: Integer;
            BestScore: Single;
            FallbackUsed: Boolean;
            DedupHits: Integer;
            LocalBeamDrops: Integer;
            PrunedBySurvivability: Integer;
            PrunedByKillRisk: Integer;
      End;

      TPredictedOpponentPlan = Record
            PlayerIndex: LongWord;
            Actions: TBeamCommandArray;
      End;

      TPredictedOpponentPlanArray = Array Of TPredictedOpponentPlan;

      TBeamDecision = Record
            Command: TBeamCommand;
            Score: Single;
            PlannedActions: TBeamCommandArray;
            Debug: TBeamDebugInfo;
      End;

Implementation

End.
