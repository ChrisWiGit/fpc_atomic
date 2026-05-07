## Schritt 5: Bewegungsmodell uebernehmen (Phase D, kritisch)

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: Schritt 4 abgeschlossen

### Ziel von Schritt 5
Die Beam-Simulation uebernimmt die servernahe Bewegungssemantik so, dass Tile-Uebergaenge, Richtungswechsel und Kollisionsfaelle wie im echten Spielverlauf behandelt werden.

### Architekturentscheidung
Die Bewegungslogik wird als separates Modul implementiert und von beam_simulate genutzt. Keine Vereinfachung auf rein ganzzahlige Kachelbewegung.

### Kernregeln (verbindlich)

1. Continuous Movement
- Positionen bleiben float-basiert.
- Tile-Zuordnung erfolgt zusaetzlich ueber diskrete Ableitung.

2. Centering-Regel
- Bewegungsentscheidungen nahe Tile-Center werden anders behandelt als zwischen Tiles.
- Center-nahe Toleranz wird explizit als Parameter gefuehrt.

3. Epsilon-Korridor
- Tile-Uebergaenge nutzen festen Epsilon-Wert fuer Grenzfaelle.
- Grenzwerte konsistent fuer X- und Y-Achse.

4. Richtungswechsel
- Turn nur erlaubt, wenn semantisch serverkonform (insb. nahe Center/gueltigem Nachbartile).

5. Kollisionen
- Blocker (Wall, Box, Bomb) stoppen oder verhindern Bewegung.
- Sonderfallbehandlung fuer bewegte Bomben/Kick-Interaktion bleibt erweiterbar.

### Modulzuschnitt

1. beam_move_types
- MoveState, Direction, TransitionFlags.

2. beam_move_rules
- Regelpruefungen fuer legalen Move und Turn.

3. beam_move_integrator
- Positionsfortschritt pro Simulationsschritt.

4. beam_move_collision
- Blockerpruefungen und Endposition bei Kollision.

5. beam_move_transition
- Tile-Wechsel, Centering, Epsilon-Faelle.

### Simulationsreihenfolge pro Tick

1. Gewuenschte Aktion lesen.
2. Legalen Richtungsvektor bestimmen.
3. Position integrieren.
4. Kollisionen aufloesen.
5. Tile-Transition und Centering anwenden.
6. Endposition + MoveState speichern.

### Testfaelle (minimal verbindlich)

1. Gerade Bewegung auf freier Bahn.
2. Turn exakt am Center.
3. Turn knapp vor/nach Center (Epsilon).
4. Bewegung gegen Blocker.
5. Diagonal ungueltig erzwingen und korrekt behandeln.
6. Tile-Grenzfall bei hoher Geschwindigkeit.

### Akzeptanzkriterien

1. Continuous- und Tile-Modell sind gleichzeitig vorhanden.
2. Epsilon- und Centering-Regeln sind explizit implementierbar beschrieben.
3. Bewegungsmodul ist vom Score/Beam-Loop entkoppelt.
4. Grenzfalltests fuer Transitionen sind definiert.
5. Simulation produziert servernahe Bewegungsresultate.

### Ergebnis
Das Bewegungsmodell ist als kritische Kernkomponente spezifiziert und kann in beam_simulate integriert werden, ohne die Beam-Architektur aufzubrechen.
