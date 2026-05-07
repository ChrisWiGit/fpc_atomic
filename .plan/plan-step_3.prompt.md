## Schritt 3: Beam-Core als eigenstaendige Pascal-API designen (Phase B, entkoppelt)

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: Schritt 2 abgeschlossen

### Ziel von Schritt 3
Der Beam-Core wird als reine Planungs-API definiert, ohne DLL-, Thread-, Socket- oder Server-Abhaengigkeiten. Die Architektur bildet explizit die fuer Bomberman relevanten Beam-Verbesserungen ab: Duplicate-Filterung, lokale Beams, Opponent Prediction sowie taktische Pruning-Regeln.

### Architekturentscheidung
Der Beam-Core wird als eigene Unit-Gruppe unterhalb des neuen AI-Projekts implementiert und nur ueber klar definierte Datentypen angesprochen.

Kernprinzipien:
1. Keine Nutzung globaler Engine-Zustaende.
2. Keine direkte Abhaengigkeit von TAiInfo im Core.
3. Deterministisches Verhalten bei identischem Input.
4. Reproduzierbare Entscheidungen durch explizite Konfiguration.
5. Taktische Filter (Survivability/Kill) sind eigene Architekturbausteine, nicht nur Heuristikdetails.

### Oeffentliche API (Designvertrag)

```pascal
Type
  TBeamDifficultyProfile = (bdEasy, bdNormal, bdHard, bdCustom);

  TBeamConfig = Record
    Profile: TBeamDifficultyProfile;
    BeamWidth: Integer;
    LocalBeamWidth: Integer;
    MaxDepth: Integer;
    NodeBudget: Integer;
    TimeBudgetMs: Integer;
    // Optional: Seed zur Initialisierung eines testbaren IRandom-Implementierung.
    RandomTieBreakerSeed: UInt32;
    EnableOpponentPrediction: Boolean;
    EnableFirstMovePruning: Boolean;
    EnableSurvivabilityChecks: Boolean;
    EnableDedupByHash: Boolean;
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

  TBeamInputState = Record
    // Reines Snapshot-Modell, aus Adapter gefuellt
  End;

  TPredictedOpponentPlan = Record
    PlayerIndex: UInt32;
    Actions: Array of TAiCommand;
  End;

  TBeamDecision = Record
    Command: TAiCommand;
    Score: Single;
    PlannedActions: Array of TAiCommand;
    Debug: TBeamDebugInfo;
  End;

Function BeamPlanNextMove(
  Const State: TBeamInputState;
  PlayerIndex: UInt32;
  Const Config: TBeamConfig;
  Const OpponentPlans: Array of TPredictedOpponentPlan
): TBeamDecision;
```

Hinweis:
1. TAiCommand bleibt Output-Typ, damit die DLL-Integration spaeter ohne Mappingbruch moeglich ist.
2. TBeamInputState wird bewusst als eigener Typ gehalten und erst im Adapter aus TAiInfo erzeugt.
3. OpponentPlans koennen extern uebergeben oder intern erzeugt werden; die API bleibt gleich.

### Modulzuschnitt innerhalb des Beam-Cores

1. beam_types
- Interne Knotentypen, Bewertungsresultate, Transitionsdaten.

2. beam_config_profiles
- Profil-Defaults und Validierung der Konfiguration.

3. beam_generate
- Kandidatenzug-Generator (Move/Action-Kombinationen, inklusive None).

4. beam_simulate
- Vorwaertssimulation auf Basis des Input-State-Modells.

5. beam_score
- Bewertung pro simuliertem Zustand (Survival > Safety > Position > Opportunitaet).

6. beam_dedup_hash
- Duplicate-Filterung pro Ebene (z. B. Zobrist-Hash).

7. beam_select_local
- Lokale Beam-Selektion pro Spielerposition (Diversitaet).

8. beam_select_global
- Globale Top-K Auswahl unter Einhaltung BeamWidth.

9. beam_opponent_model
- Vorhersage von Gegneraktionsfolgen fuer die Simulation.

10. beam_tactical_filters
- First-Move-Pruning, Survivability-Checks, Kill-Risk-Checks.

11. beam_search_core
- Beam-Loop, Ebenenverwaltung, Pruning-Reihenfolge, finale Auswahl.

12. beam_metrics_debug
- Sammeln und Exportieren von Laufzeit-/Qualitaetsmetriken.

13. beam_api
- Oeffentliche Einstiegsfunktion BeamPlanNextMove.

### Algorithmische Reihenfolge pro Tick

1. Eingabestate und Konfiguration validieren.
2. Optional OpponentPrediction erzeugen oder gegebene OpponentPlans verwenden.
3. Initiale Kandidaten erzeugen.
4. First-Move-Pruning ausfuehren (Survivability/Kill-Risk).
5. Pro Tiefe:
- expandieren
- simulieren
- bewerten
- deduplizieren
- lokal selektieren
- global selektieren
6. Besten Erstzug und optionale Planfolge zurueckgeben.

### Konfigurationsregeln

1. bdEasy
- Kleine Beam-Breite, geringe Tiefe, kleines Node-Budget, reduzierte Filterkosten.

2. bdNormal
- Mittlere Beam-Breite/Tiefe, aktivierte Dedup+LocalBeam+FirstMovePruning.

3. bdHard
- Hoehere Tiefe/Breite, groesseres Budget, volle taktische Filter.

4. bdCustom
- Werte kommen direkt aus Config, werden aber geclamped und validiert.

Validierung:
1. BeamWidth >= 1
2. LocalBeamWidth >= 1
3. MaxDepth >= 1
4. NodeBudget >= BeamWidth
5. TimeBudgetMs >= 0

### Determinismus und Stabilitaet

1. Tie-Breaking erfolgt ueber injiziertes `IRandom` mit 50:50-Entscheidung bei gleichem Score; zur Testbarkeit kann ein deterministischer `IRandom` verwendet werden.
2. Reihenfolge der Kandidatengenerierung ist fest definiert.
3. Hashing und Selektion sind deterministisch implementiert.
4. Bei Budget- oder Simulationsfehlern wird ein sicherer Fallback geliefert.
5. Core wirft keine Exceptions nach aussen; Fehler werden in Debug/Fallback signalisiert.

### Schnittstelle zum Adapter (Vorbereitung auf Schritt 4)
Der Adapter liefert spaeter:
1. Feldbelegung und Tile-Eigenschaften.
2. Kontinuierliche Spielerpositionen und Bewegungsrichtung.
3. Bombeninformationen (Position, Timer, Reichweite).
4. Gegner- und Teaminformationen.
5. Aktive Faehigkeiten in normalisierter Form.

Der Beam-Core erwartet nur das normalisierte TBeamInputState-Format.

### Akzeptanzkriterien fuer Schritt 3

1. Oeffentlicher API-Vertrag ist festgelegt (Input, Config, Output, Debug).
2. Modulzuschnitt enthaelt explizit Dedup, LocalBeam, OpponentModel und TacticalFilters.
3. Pruning-Reihenfolge und Selektionsstufen sind definiert.
4. Determinismus- und Fallback-Regeln sind dokumentiert.
5. Uebergabe an Schritt 4 (Adapterbau) ist klar vorbereitet.

### Ergebnis
Der Beam-Core ist als eigenstaendige Pascal-API spezifiziert und deckt die entscheidenden Verbesserungen fuer starke Bomberman-Beam-Agenten strukturell ab, ohne an DLL-Entry oder Servercode gekoppelt zu sein.
