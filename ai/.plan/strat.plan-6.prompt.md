## Strategieplan 6: Risk-Budget + Time-Budget-Stop

Status: Geplant  
Prioritaet: Mittel

### Enthaltene Strategien

1. Risk-Budget je Difficulty (Easy konservativ, Hard kalkuliertes Risiko)
2. Time-Budget-aware Stop-Kriterium

### Ziel

Die AI soll je Schwierigkeitsgrad reproduzierbar unterschiedliche Risiko-Profile fahren und gleichzeitig stabil innerhalb des Zeitbudgets bleiben.

### Umsetzungsschritte

1. Risk-Budget in Config verankern
- Difficulty-abhängige Risiko-Schwellen im Score/Filter anwenden.

2. Time-Budget aktiv auswerten
- Suche früh abbrechen, bestes bisheriges Ergebnis zuverlässig zurückgeben.

3. Determinismus absichern
- Trotz Zeitgrenzen reproduzierbares Verhalten mit Seed sicherstellen.

### Betroffene Dateien

1. ubeam_config_profiles.pas
2. ubeam_search_core.pas
3. ubeam_tactical_filters.pas
4. tests/test_ubeam_search.pas

### Akzeptanzkriterien

1. Klar unterscheidbares Risiko-Verhalten zwischen Easy/Hard.
2. Keine Timeout-bedingten Instabilitäten.
3. Tests grün.
