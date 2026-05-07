## Strategieplan 5: Item-Value-Kontext + Anti-Stall

Status: Geplant  
Prioritaet: Mittel

### Enthaltene Strategien

1. Kontextabhängiger Item-Wert statt pauschaler Bonus
2. Anti-Stall / Initiative-Heuristik

### Ziel

Die AI soll nützliche Items in der aktuellen Situation priorisieren und nicht in passivem Warten hängen bleiben.

### Umsetzungsschritte

1. Item-Wert dynamisch berechnen
- Beispiel: Trigger deutlich wertvoller bei mehreren aktiven eigenen Bomben.

2. Stall-Erkennung einführen
- Wiederholte „nichts tun“-Muster erkennen.
- Leichten Initiativ-Bonus für sichere aktive Züge geben.

3. Safety-Guard beibehalten
- Initiative darf nie Safety überstimmen.

### Betroffene Dateien

1. ubeam_scorer.pas
2. ubeam_candidates.pas
3. tests/test_ubeam_search.pas

### Akzeptanzkriterien

1. Weniger passive Move-Sequenzen ohne Sicherheitsverlust.
2. Kontextabhängige Item-Aufnahme verbessert Entscheidungen.
3. Tests grün.
