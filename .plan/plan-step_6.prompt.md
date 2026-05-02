## Schritt 6: Beam-Entscheidungslogik implementieren (Phase E)

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: Schritt 5 abgeschlossen

### Ziel von Schritt 6
Die vollstaendige Beam-Entscheidungslogik wird spezifiziert: Kandidatengenerierung, Vorwaertssimulation, Bewertung, Pruning und finale Aktionsauswahl inklusive Difficulty-Steuerung ueber Beam-Parameter.

### Suchpipeline (pro Tick)

1. Initiale Kandidaten erzeugen
- Move: amNone, amLeft, amRight, amUp, amDown
- Action: apNone, apFirst, apSecond (spielkonform)

2. First-Move-Pruning
- ungueltige Kandidaten verwerfen
- optional Survivability/Kill-Risk Filter anwenden

3. Iterative Beam-Ebenen
- expandieren
- simulieren
- bewerten
- deduplizieren
- local select
- global select

4. Abbruchbedingungen
- MaxDepth erreicht
- NodeBudget erreicht
- TimeBudgetMs erreicht

5. Finale Entscheidung
- bester Erstzug
- optionale PlannedActions
- Debug-Metriken

### Bewertungsstrategie

Prioritaeten:
1. Survival (hart)
2. unmittelbare Gefahrvermeidung
3. taktischer Vorteil (Boxen, Position, Druck)
4. opportunistische Aktionen

Score-Komponenten (beispielhafte Struktur):
1. DeadPenalty (sehr gross negativ)
2. SurvivableBonus
3. RiskPenalty (nahe Flamme/Bombe)
4. Utility (Boxen, Items, Raumkontrolle)
5. PositionalScore

### Difficulty-Mapping

1. Easy
- kleine BeamWidth
- kleine MaxDepth
- reduziertes NodeBudget

2. Normal
- mittlere Werte
- dedup + local beam aktiv

3. Hard
- groessere BeamWidth/Depth
- volles taktisches Pruning aktiv

4. Custom
- direkte Werte aus Config
- vor Ausfuehrung validieren/clampen

### Pruning- und Selektionsregeln

1. Dedup
- gleiche Zustaende pro Ebene ueber Hash zusammenfassen.

2. Local Beam
- pro Position maximal LocalBeamWidth Zustaende behalten.

3. Global Beam
- insgesamt maximal BeamWidth Zustaende behalten.

4. Tie-Breaking
- deterministisch via Seed + feste Ordnungsregeln.

### Debug/Metriken (Pflichtfelder)

1. ExpandedNodes
2. EvaluatedNodes
3. SelectedDepth
4. BestScore
5. DedupHits
6. LocalBeamDrops
7. PrunedBySurvivability
8. PrunedByKillRisk
9. FallbackUsed

### Fehler- und Fallbackverhalten

1. Bei inkonsistentem Input sicheren Command liefern.
2. Bei Budget-Ueberschreitung bestes bisheriges Ergebnis liefern.
3. Keine ungefangenen Exceptions nach aussen.

### Akzeptanzkriterien

1. End-to-end Pipeline ist vollstaendig spezifiziert.
2. Pruning- und Selektionsregeln sind eindeutig.
3. Difficulty-Mapping ist klar mit Config verbunden.
4. Debug-Metriken sind fuer Tuning und Replay-Analyse ausreichend.
5. Ausgabe ist direkt in DLL-Integration nutzbar.

### Ergebnis
Die Beam-Entscheidungslogik ist als implementierbarer Ablauf definiert und schliesst die algorithmische Kernphase fuer den produktiven Agenten ab.
