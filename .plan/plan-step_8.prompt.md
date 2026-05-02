## Schritt 8: Testbarkeit sicherstellen

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: parallel zu Schritt 6/7 entwickelbar, Finalisierung nach Schritt 7

### Ziel von Schritt 8
Die Korrektheit von Beam-Core, Adapter und DLL-Vertrag wird durch drei unabhaengige Teststufen nachgewiesen.

### Teststufen

#### Stufe 1: Beam-Core Unit-Tests
Ziel: Algorithmus isoliert pruefbar ohne DLL oder Server.

Testfaelle:
1. Konfigurationsvalidierung (invalid clamping, profile defaults).
2. Kandidatengenerierung (alle Move/Action-Kombinationen).
3. Dedup-Modul (Hash-Kollisionen, bekannte Duplikate).
4. Local-Beam-Selektion (mehr als LocalBeamWidth Kandidaten).
5. Global-Beam-Selektion (mehr als BeamWidth Kandidaten).
6. Tactical Filters (Survivability pruning, Kill-Risk pruning).
7. Score-Vergleich (DeadPenalty schlaegt positiven Score).
8. Fallback-Verhalten (leere Kandidaten, Budget 0).
9. Determinismus (zweimaliger Aufruf mit gleichem Input).

#### Stufe 2: Bewegungslogik-Tests
Ziel: Servernahe Bewegungssemantik verifizieren.

Testfaelle:
1. Gerade Bewegung korrekte Positionsfortschreibung.
2. Centering am Tile-Center.
3. Turn knapp vor Tile-Center (erlaubt).
4. Turn knapp nach Tile-Center (erlaubt oder nicht, epsilon-abhaengig).
5. Bewegung gegen Blocker stoppt.
6. Tile-Uebergang bei hoher Geschwindigkeit.
7. MoveDirection konsistent nach Richtungswechsel.

#### Stufe 3: Contract-Tests DLL-Exports
Ziel: DLL ist Drop-in-kompatibel mit server/uai.pas Lademechanismus.

Testfaelle:
1. AiInterfaceVersion liefert erwarteten Wert.
2. AiVersion liefert nicht-leeren String.
3. AiInit + AiDeInit ohne Crash.
4. AiNewRound fuer alle Strength-Werte 0-100.
5. AiHandlePlayer mit minimalem gueltigen TAiInfo.
6. AiHandlePlayer mit Edge-Case: alle Spieler tot.
7. AiHandlePlayer mehrfach hintereinander (kein Zustandsleak).
8. AiDeInit zweimal aufrufen (kein Crash).

#### Stufe 4: Replay / Golden-Tests (optional, fuer Qualitaetssicherung)
Ziel: Entscheidungsqualitaet mit gespeicherten TAiInfo-Snapshots pruefen.

Vorgehen:
1. Echte TAiInfo-Snapshots aus Spielsitzungen aufzeichnen.
2. Erwarteten sicheren Command als Baseline festlegen.
3. Beam-Ausgabe gegen Baseline testen.
4. Regressionen bei Algorithmenaenderungen erkennen.

### Testinfrastruktur

1. Stufe 1+2: eigene Pascal-Testunit, kein Server noetig.
2. Stufe 3: minimales DLL-Ladegeheuse, analog zu server/uai.pas.
3. Stufe 4: Snapshot-Dateien in .testdata/ Verzeichnis.

### Akzeptanzkriterien

1. Stufe 1 und 2 sind implementiert und alle Faelle gruenen.
2. Stufe 3 ist implementiert und alle Exports bestehen.
3. Stufe 4 ist vorbereitet (Framework und Snapshot-Format definiert).
4. Kein Testlauf erfordert laufenden Server oder OpenGL.

### Ergebnis
Die Testabdeckung ist aufgebaut und ermoeglicht sicheres Weiterentwickeln und Tuning des Beam-Agenten ohne Serverbetrieb.
