## Strategieplan 1: Safe-Corridor + Trigger-Timing

Status: Geplant  
Prioritaet: Hoch

### Enthaltene Strategien

1. Escape-First mit Safe-Corridor-Bewertung
2. Trigger-Timing bei Gegner in Strahlbahn

### Ziel

Die AI soll zuerst robuste Fluchtpfade sichern und danach opportunistisch triggern, wenn ein Gegner verlässlich in der Explosionslinie gehalten werden kann.

### Umsetzungsschritte

1. Safe-Corridor-Feature einführen
- Für jeden Kandidaten Anzahl sicherer Folgefelder für 1-2 Züge berechnen.
- Direkten Dead-End-Risiko-Malus vergeben.

2. Trigger-Window-Logik ergänzen
- Eigene aktive Bomben auf Strahlbahn prüfen.
- Trigger nur priorisieren, wenn Gegner erreichbar ist und Eigenrisiko unter Schwellwert bleibt.

3. Scoring integrieren
- `EscapeScore` als harte Priorität vor Opportunitäts-Score.
- `TriggerOpportunityScore` nur bei erfülltem Safety-Gate.

4. Tests ergänzen
- Snapshot-Fälle: „gegner in linie, selbst sicher“ und „gegner in linie, selbst unsicher“.

### Betroffene Dateien

1. ubeam_scorer.pas
2. ubeam_tactical_filters.pas
3. ubeam_search_core.pas
4. tests/test_ubeam_search.pas
5. tests/.testdata/*

### Akzeptanzkriterien

1. Kein Trigger bei Selbstgefährdung.
2. Höhere Escape-Stabilität in Engstellen.
3. Determinismus bleibt mit gleichem Seed erhalten.
4. Alle Tests bleiben grün (`make test`).
