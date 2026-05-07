## Schritt 4: Spielzustands-Adapter bauen (Phase C, Engine-Reuse)

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: Schritt 3 abgeschlossen

### Ziel von Schritt 4
Ein stabiler Adapter uebersetzt TAiInfo in TBeamInputState, damit der Beam-Core nur mit normalisierten, engine-unabhaengigen Daten arbeitet.

### Architekturentscheidung
Der Adapter liegt zwischen DLL-Agent-Layer und Beam-Core und ist die einzige Stelle, die TAiInfo direkt kennt.

### Ein-/Ausgabe

Input:
1. TAiInfo (vom Server)
2. PlayerIndex
3. Optionale Rundendaten (Frame, Seed)

Output:
1. TBeamInputState
2. Optional TPredictedOpponentPlan Array (wenn intern erzeugt)
3. AdapterDebug (optional)

### Modulzuschnitt

1. beam_adapter_types
- Mapping-Hilfstypen fuer Tile, Bomb, Player, Ability.

2. beam_adapter_map
- Feldlayout, Blocker, freie Felder, Sondertiles.

3. beam_adapter_players
- Spielerstatus, Team, Alive, Position, Richtung, Speed.

4. beam_adapter_bombs
- Bombenposition, Timer, Range, Owner, Kettenreaktion-Relevanz.

5. beam_adapter_abilities
- Kick, Punch, Grab, Disease und weitere Flags normalisieren.

6. beam_adapter_finalize
- Konsistenzpruefungen und Endaufbau von TBeamInputState.

### Mapping-Regeln (verbindlich)

1. Positionen
- Continuous-Werte werden unveraendert uebernommen.
- Zusaetzlich werden Tile-Koordinaten und Relative-Offset-Werte gespeichert.

2. Feldbelegung
- Harte Blocker: Wall, Box, Bomb.
- Weiche Zustaende (z. B. Item auf Feld) getrennt von Blockern halten.

3. Bomben
- Timer und Reichweite unveraendert uebernehmen.
- Owner-Referenz stabil als Index speichern.

4. Gegnerdaten
- Alle Gegner mit Alive-Flag fuehren, auch wenn ausgeschieden.
- TeamPlay-Info in ein neutrales TeamId-Feld mappen.

5. Faehigkeiten
- Nur boolean/integer normalisierte Werte in den Core geben.

### Validierung

1. Pflichtfelder vorhanden (Map, Players, Bombs).
2. PlayerIndex gueltig und auf Alive-Status geprueft.
3. Out-of-bounds-Daten verwerfen oder clampen.
4. Keine Exceptions nach aussen; Fehler als Fallback-Zustand markieren.

### Schnittstelle zu Schritt 5
Der Adapter liefert fuer die Bewegungslogik explizit:
1. exakte X/Y Position
2. TileX/TileY
3. Distanz zum Tile-Center
4. aktuelle MoveDirection
5. kollisionsrelevante Nachbartiles

### Akzeptanzkriterien

1. TAiInfo -> TBeamInputState Mapping ist komplett dokumentiert.
2. Adapter kennt TAiInfo, Beam-Core nicht.
3. Alle relevanten Entities sind normalisiert.
4. Fehlerbehandlung und Fallback sind definiert.
5. Daten fuer exakte Tile-Uebergangslogik sind vorhanden.

### Ergebnis
Der Adapter ist als klare Uebersetzungsschicht spezifiziert und bereitet den Input fuer die praezise Bewegungsmodellierung in Schritt 5 vor.
