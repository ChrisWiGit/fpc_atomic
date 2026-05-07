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
Unit ubeam_irandom;

{$MODE ObjFPC}{$H+}

Interface

Type
      // Injected random source for reproducible tie-breaking in beam selection.
      IRandom = Interface
            // Returns a float in [0, 1).
            Function NextFloat(): Single;
            // Returns an integer in [0, N). Returns 0 when N <= 1.
            Function NextIntBelow(N: Integer): Integer;
      End;

      // Deterministic LCG implementation of IRandom. Using this with a fixed
      // seed makes beam tie-breaking fully reproducible in tests.
      TLcgRandom = Class(TInterfacedObject, IRandom)
      Private
            fState: LongWord;
      Public
            Constructor Create(Seed: LongWord);
            Function NextFloat(): Single;
            Function NextIntBelow(N: Integer): Integer;
      End;

// Returns True with a probability matching Weight [0..100].
// Weight=0: always False. Weight>=100: always True.
// Values 1-99 use Rng for a reproducible roll.
Function RollStrategyWeight(Weight: Byte; Rng: IRandom): Boolean;

Implementation

Constructor TLcgRandom.Create(Seed: LongWord);
Begin
      fState := Seed Or 1; // guarantee non-zero state
End;

Function TLcgRandom.NextFloat(): Single;
Begin
      fState := fState * 1664525 + 1013904223; // Knuth multiplicative LCG
      Result := (fState Shr 8) / 16777216.0;   // 24-bit resolution in [0, 1)
End;

Function TLcgRandom.NextIntBelow(N: Integer): Integer;
Begin
      If N <= 1 Then Begin
            Result := 0;
            Exit;
      End;
      Result := Trunc(NextFloat() * N);
      If Result >= N Then
            Result := N - 1;
End;

Function RollStrategyWeight(Weight: Byte; Rng: IRandom): Boolean;
Begin
      If Weight = 0 Then
            Exit(False);
      If Weight >= 100 Then
            Exit(True);
      Result := Rng.NextIntBelow(100) < Integer(Weight);
End;

End.
