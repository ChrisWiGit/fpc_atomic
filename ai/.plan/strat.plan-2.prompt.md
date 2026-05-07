## Strategieplan 2: Trap-Setup + Bomben-Ketten

Status: Geplant  
Prioritaet: Hoch

### Enthaltene Strategien

1. Trap-Setup in 2-3 Zügen
2. Bomben-Ketten (Chain-Reaction) als eigene Taktik

### Ziel

Die AI soll nicht nur reaktiv ausweichen, sondern proaktiv Fallen und Kettenreaktionen vorbereiten, um Raum zu kontrollieren und Kills wahrscheinlicher zu machen.

### Umsetzungsschritte

1. Trap-Potenzial bewerten
- Kandidaten danach bewerten, wie viele gegnerische Ausweichfelder in 1-2 Folgeschritten reduziert werden.
- Bonus für „Fluchtkorridor schließen“.

2. Chain-Reaction-Simulation erweitern
- Bomben-zu-Bomben-Triggerwirkung approximieren (Reichweite, Zündreihenfolge).
- Gefahr- und Opportunitätswerte aus Kette ableiten.

3. Tactical Filter ergänzen
- Offensichtlich selbstmörderische Trap- oder Chain-Kandidaten verwerfen.

4. Replay-basierte Tests
- Goldens für „Kette trifft Gegner“, „Kette blockt Gegner“, „Kette gefährdet Self“.

### Betroffene Dateien

1. ubeam_simulator.pas
2. ubeam_scorer.pas
3. ubeam_tactical_filters.pas
4. tests/test_ubeam_search.pas
5. tests/.testdata/*

### Akzeptanzkriterien

1. Kettenreaktionen werden im Score sichtbar bevorzugt, wenn sicher.
2. Trap-Setups führen zu mehr Gegnerdruck in Folgezügen.
3. Keine Regression der Safety-Fallback-Regeln.
4. Alle Tests bleiben grün (`make test`).
