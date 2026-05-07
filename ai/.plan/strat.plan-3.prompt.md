## Strategieplan 3: Zonen-Kontrolle + Phasen-Tempo

Status: Geplant  
Prioritaet: Mittel

### Enthaltene Strategien

1. Zonen-Kontrolle (Druck auf Engstellen/Randzonen)
2. Spielphasen-Tempo (Early/Mid/End)

### Ziel

Die AI soll den Raum aktiv steuern und je nach Spielphase unterschiedliche Prioritäten setzen.

### Umsetzungsschritte

1. Zonenmetriken ergänzen
- Freie Felder, Engstellen-Nähe, Randzonen-Druck bewerten.

2. Phase-Classifier einführen
- Early: item- und raumorientiert.
- Mid: druckorientiert.
- End: duell-/trap-orientiert.

3. Gewichtung dynamisch machen
- Score-Gewichte anhand Phase umschalten.

### Betroffene Dateien

1. ubeam_scorer.pas
2. ubeam_search_core.pas
3. tests/test_ubeam_search.pas

### Akzeptanzkriterien

1. Sichtbarer Strategiewechsel je Phase.
2. Keine Verletzung der Safety-Priorität.
3. Tests grün.
