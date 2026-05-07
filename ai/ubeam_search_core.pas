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
Unit ubeam_search_core;

{$MODE ObjFPC}{$H+}

Interface

Uses
      ubeam_types,
      ubeam_irandom;

Function RunBeamSearch(
      Const State: TBeamInputState;
      PlayerIndex: LongWord;
      Const Config: TBeamConfig;
      Const OpponentPlans: TPredictedOpponentPlanArray;
      Random: IRandom
): TBeamDecision;

Implementation

Uses
      SysUtils,
      ubeam_tactical_filters,
      ubeam_candidates,
      ubeam_simulator,
      ubeam_scorer;

// ---------------------------------------------------------------------------
// Internal beam-node type: one entry in the beam at any depth.
// ---------------------------------------------------------------------------
Type
      TBeamNode = Record
            State    : TBeamInputState;
            FirstMove: TBeamCommand;
            Score    : Single;
      End;
      TBeamNodeArray = Array Of TBeamNode;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

Procedure InitDebug(Var D: TBeamDebugInfo);
Begin
      D.ExpandedNodes        := 0;
      D.EvaluatedNodes       := 0;
      D.SelectedDepth        := 0;
      D.BestScore            := 0.0;
      D.FallbackUsed         := True;
      D.DedupHits            := 0;
      D.LocalBeamDrops       := 0;
      D.PrunedBySurvivability := 0;
      D.PrunedByKillRisk     := 0;
End;

Function MakeFallbackDecision(Const Debug: TBeamDebugInfo): TBeamDecision;
Begin
      Result.Command.Action  := baNone;
      Result.Command.Move    := bmNone;
      Result.Score           := 0.0;
      Result.PlannedActions  := Nil;
      Result.Debug           := Debug;
      Result.Debug.FallbackUsed := True;
End;

// Add a small random noise to a score for reproducible tie-breaking.
// The noise is sub-unit so it never overrides meaningful score differences.
Function Jitter(Score: Single; Random: IRandom): Single;
Begin
      Result := Score + Random.NextFloat() * 0.001;
End;

// ---------------------------------------------------------------------------
// Deduplication: keep only the highest-scoring node per tile position.
// ---------------------------------------------------------------------------

Procedure ApplyDedup(Var Nodes: TBeamNodeArray; FW: Integer;
                     Var DedupHits: Integer);
Var
      I, J, Hash: Integer;
      Hashes : Array Of Integer;
      Kept   : TBeamNodeArray;
      Found  : Boolean;
Begin
      SetLength(Hashes, 0);
      Kept := Nil;
      For I := 0 To High(Nodes) Do Begin
            Hash  := Nodes[I].State.Self.TileY * FW + Nodes[I].State.Self.TileX;
            Found := False;
            For J := 0 To High(Hashes) Do Begin
                  If Hashes[J] = Hash Then Begin
                        Found := True;
                        If Nodes[I].Score > Kept[J].Score Then
                              Kept[J] := Nodes[I]
                        Else
                              Inc(DedupHits);
                        Break;
                  End;
            End;
            If Not Found Then Begin
                  SetLength(Hashes, Length(Hashes) + 1);
                  Hashes[High(Hashes)] := Hash;
                  SetLength(Kept, Length(Kept) + 1);
                  Kept[High(Kept)] := Nodes[I];
            End;
      End;
      Nodes := Kept;
End;

// ---------------------------------------------------------------------------
// Local-beam selection: per tile position keep at most LocalWidth nodes.
// ---------------------------------------------------------------------------

Procedure ApplyLocalBeam(Var Nodes: TBeamNodeArray; LocalWidth, FW: Integer;
                         Var LocalBeamDrops: Integer);
Var
      I, J, Hash, Count: Integer;
      Hashes : Array Of Integer;
      Counts : Array Of Integer;
      Kept   : TBeamNodeArray;
Begin
      If LocalWidth <= 0 Then Exit;
      SetLength(Hashes, 0);
      SetLength(Counts, 0);
      Kept := Nil;
      For I := 0 To High(Nodes) Do Begin
            Hash  := Nodes[I].State.Self.TileY * FW + Nodes[I].State.Self.TileX;
            Count := 0;
            For J := 0 To High(Hashes) Do Begin
                  If Hashes[J] = Hash Then Begin
                        Count := Counts[J];
                        Break;
                  End;
            End;
            If Count < LocalWidth Then Begin
                  // Find or create slot for this tile
                  For J := 0 To High(Hashes) Do Begin
                        If Hashes[J] = Hash Then Begin
                              Inc(Counts[J]);
                              Break;
                        End;
                  End;
                  If Count = 0 Then Begin
                        SetLength(Hashes, Length(Hashes) + 1);
                        SetLength(Counts, Length(Counts) + 1);
                        Hashes[High(Hashes)] := Hash;
                        Counts[High(Counts)] := 1;
                  End;
                  SetLength(Kept, Length(Kept) + 1);
                  Kept[High(Kept)] := Nodes[I];
            End
            Else Begin
                  Inc(LocalBeamDrops);
            End;
      End;
      Nodes := Kept;
End;

// ---------------------------------------------------------------------------
// Global beam selection: keep the best GlobalWidth nodes by score.
// Uses insertion sort (O(n²)) — beam sizes are small.
// ---------------------------------------------------------------------------

Procedure ApplyGlobalBeam(Var Nodes: TBeamNodeArray; GlobalWidth: Integer);
Var
      I, J: Integer;
      Tmp: TBeamNode;
Begin
      If Length(Nodes) <= GlobalWidth Then Exit;

      // Partial insertion sort: pull top-GlobalWidth nodes to the front
      For I := 0 To GlobalWidth - 1 Do Begin
            For J := I + 1 To High(Nodes) Do Begin
                  If Nodes[J].Score > Nodes[I].Score Then Begin
                        Tmp      := Nodes[I];
                        Nodes[I] := Nodes[J];
                        Nodes[J] := Tmp;
                  End;
            End;
      End;
      SetLength(Nodes, GlobalWidth);
End;

// ---------------------------------------------------------------------------
// Best node from a (non-empty) beam.
// ---------------------------------------------------------------------------

Function BestNode(Const Nodes: TBeamNodeArray): TBeamNode;
Var
      I: Integer;
Begin
      Result := Nodes[0];
      For I := 1 To High(Nodes) Do Begin
            If Nodes[I].Score > Result.Score Then
                  Result := Nodes[I];
      End;
End;

Function RunBeamSearch(
      Const State: TBeamInputState;
      PlayerIndex: LongWord;
      Const Config: TBeamConfig;
      Const OpponentPlans: TPredictedOpponentPlanArray;
      Random: IRandom
): TBeamDecision;
Var
      Debug     : TBeamDebugInfo;
      Candidates: TBeamCommandArray;
      Beam      : TBeamNodeArray;
      NextBeam  : TBeamNodeArray;
      I, J      : Integer;
      Node      : TBeamNode;
      Cmd       : TBeamCommand;
      NextState : TBeamInputState;
      Score     : Single;
      Best      : TBeamNode;
Begin
      InitDebug(Debug);

      // Guard: player index must match focus
      If Integer(PlayerIndex) <> State.FocusPlayerIndex Then Begin
            Result := MakeFallbackDecision(Debug);
            Exit;
      End;

      // Guard: dead focus player cannot act
      If Not State.Self.Alive Then Begin
            Debug.PrunedBySurvivability := 1;
            Result := MakeFallbackDecision(Debug);
            Exit;
      End;

      // Guard: invalid budget cannot evaluate any candidate.
      If Config.NodeBudget <= 0 Then Begin
            Result := MakeFallbackDecision(Debug);
            Exit;
      End;

      // Guard: missing random source would break tie handling.
      If Random = Nil Then Begin
            Result := MakeFallbackDecision(Debug);
            Exit;
      End;

      // ---------------------------------------------------------------
      // Depth 1: generate, prune and score initial candidates
      // ---------------------------------------------------------------
      Candidates := GenerateCandidates(State);
      Beam       := Nil;

      For I := 0 To High(Candidates) Do Begin
            Cmd := Candidates[I];

            If Config.EnableFirstMovePruning Then Begin
                  If Not PassesFirstMovePruning(State, Cmd, Debug) Then
                        Continue;
            End;

            NextState := SimulateNextState(State, Cmd, OpponentPlans, 0);
            Score     := Jitter(ScoreState(NextState), Random);
            Inc(Debug.EvaluatedNodes);

            SetLength(Beam, Length(Beam) + 1);
            Beam[High(Beam)].State     := NextState;
            Beam[High(Beam)].FirstMove := Cmd;
            Beam[High(Beam)].Score     := Score;

            If Debug.EvaluatedNodes >= Config.NodeBudget Then Break;
      End;

      If Length(Beam) = 0 Then Begin
            Result := MakeFallbackDecision(Debug);
            Exit;
      End;

      Inc(Debug.ExpandedNodes);
      Debug.SelectedDepth := 1;

      // Initial global beam trim
      ApplyGlobalBeam(Beam, Config.BeamWidth);

      // ---------------------------------------------------------------
      // Depths 2..MaxDepth: expand, score, deduplicate, select
      // ---------------------------------------------------------------
      While (Debug.SelectedDepth < Config.MaxDepth) And
            (Debug.EvaluatedNodes < Config.NodeBudget) Do Begin

            NextBeam := Nil;

            For I := 0 To High(Beam) Do Begin
                  Node       := Beam[I];
                  Candidates := GenerateCandidates(Node.State);
                  Inc(Debug.ExpandedNodes);

                  For J := 0 To High(Candidates) Do Begin
                        Cmd       := Candidates[J];
                        NextState := SimulateNextState(
                              Node.State, Cmd, OpponentPlans, Debug.SelectedDepth);
                        Score := Jitter(ScoreState(NextState), Random);
                        Inc(Debug.EvaluatedNodes);

                        SetLength(NextBeam, Length(NextBeam) + 1);
                        NextBeam[High(NextBeam)].State     := NextState;
                        NextBeam[High(NextBeam)].FirstMove := Node.FirstMove;
                        NextBeam[High(NextBeam)].Score     := Score;

                        If Debug.EvaluatedNodes >= Config.NodeBudget Then Break;
                  End;

                  If Debug.EvaluatedNodes >= Config.NodeBudget Then Break;
            End;

            Inc(Debug.SelectedDepth);

            If Length(NextBeam) = 0 Then Break;

            If Config.EnableDedupByHash Then
                  ApplyDedup(NextBeam, State.FieldWidth, Debug.DedupHits);

            ApplyLocalBeam(NextBeam, Config.LocalBeamWidth, State.FieldWidth,
                           Debug.LocalBeamDrops);
            ApplyGlobalBeam(NextBeam, Config.BeamWidth);

            Beam := NextBeam;
      End;

      // ---------------------------------------------------------------
      // Return best first move found
      // ---------------------------------------------------------------
      Best            := BestNode(Beam);
      Debug.BestScore := Best.Score;
      Debug.FallbackUsed := False;

      Result.Command       := Best.FirstMove;
      Result.Score         := Best.Score;
      Result.PlannedActions := Nil;
      Result.Debug         := Debug;
End;

End.
