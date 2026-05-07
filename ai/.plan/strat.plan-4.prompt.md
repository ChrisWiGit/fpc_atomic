## Strategieplan 4: Gegnerprofil + Teamplay-Koordination

Status: Geplant  
Prioritaet: Mittel

### Enthaltene Strategien

1. Gegnerprofil pro Spieler (aggressiv/defensiv/item-fokus)
2. Teamplay-Regeln (friendly-fire vermeiden, Fokusziel 2v1)

### Ziel

Die AI soll Gegnerverhalten adaptiv ausnutzen und im Teammodus koordiniert handeln.

### Umsetzungsschritte

1. Leichtgewichtiges Gegnerprofil führen
- Pro Gegner einfache Verhaltenszähler (Bombenfrequenz, Distanzverhalten, Risiko).

2. Teamplay-Constraints ergänzen
- Friendly-fire-Malus.
- Bonus für gemeinsame Druckrichtung auf ein Ziel.

3. Opponent model anbinden
- Vorhersagen nicht mehr nur neutral, sondern profilbasiert.

### Betroffene Dateien

1. ubeam_opponent_model.pas
2. ubeam_scorer.pas
3. ubeam_search_core.pas
4. tests/test_ubeam_search.pas

### Akzeptanzkriterien

1. Weniger friendly-fire-Situationen im Teamplay.
2. Profilabhängige Reaktion auf Gegnertypen.
3. Tests grün.
