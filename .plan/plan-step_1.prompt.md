## Schritt 1: Ist-Zustand und Scope-Schnitt

Status: Erledigt  
Datum: 2026-04-30

### Ziel von Schritt 1
Den aktuellen Stand der AI-Implementierungen erfassen und den Migrations-Scope für eine native Pascal/Lazarus-DLL mit Beam-Search klar schneiden.

### Bestand (Ist-Zustand)

1. Native DLL-Basis ist bereits vorhanden und funktionsfähig:
- ai/ai.lpr exportiert den vollständigen AI-Vertrag (AiInit, AiDeInit, AiInterfaceVersion, AiVersion, AiNewRound, AiHandlePlayer).
- server/uai.pas lädt die DLL dynamisch und prüft die Interface-Version.
- server/uatomic_server.pas ruft AiHandlePlayer zyklisch im Server-Loop auf.

2. Spielzustand und AI-Interface sind sauber definiert:
- server/uai_types.pas enthält TAiInfo, TAiCommand, TAiMoveState, TAiPlayerAction und Positions-/Feldtypen.
- Positionen sind kontinuierlich (0.5-basiert), nicht rein grid-basiert.

3. Bewegungs- und Übergangslogik ist serverseitig bereits vorhanden:
- units/uatomic_field.pas in HandleMovePlayer enthält das kritische Verhalten für Tile-Übergänge:
  - Epsilon-basierte Kachelwechsel
  - Centering auf 0.5
  - Kollisionen und Bewegungsentscheidungen an Feldgrenzen
- units/uatomic_field.pas in GetAiInfo erzeugt den AI-Snapshot aus dem echten Spielzustand.

4. TypeScript/WebSocket-Pfad ist vorhanden, aber overengineered und fragil:
- ai_1/ai.lpr + ai_1/aicommserver.pas bilden eine WS-Bridge zwischen DLL und Node/TS.
- AiDeInit ist in ai_1/ai.lpr praktisch deaktiviert (Unload-/Crash-Hinweis).
- ai_1/aiTypescript enthält nur prototypische Beam-Ansätze; searchBeam.ts ist unvollständig.

### Scope-Schnitt (Include/Exclude)

### Include (für Migration weiterverwenden)
- AI-DLL-Vertrag und Ladepfad aus:
  - ai/ai.lpr
  - server/uai.pas
  - server/uai_types.pas
  - server/uatomic_server.pas
- Spielzustandsgewinnung und Bewegungssemantik aus:
  - units/uatomic_field.pas (insb. HandleMovePlayer, GetAiInfo)
  - units/uatomic_common.pas (Konstanten: FieldWidth, FieldHeight, FrameRate, Geschwindigkeiten)
- Optional heuristische Referenz aus:
  - ai/uatomicai.pas

### Referenzbestand (bleibt erhalten)
- WebSocket-Bridge und JSON-Transport bleiben als Referenz erhalten:
  - ai_1/ai.lpr
  - ai_1/aicommserver.pas
  - ai_1/AiInfoJson.pas
- Node/TypeScript-Runtime bleibt als Ideen-/Vergleichsbasis erhalten:
  - ai_1/aiTypescript komplett

### Exclude (aus aktivem Zielruntime-Pfad)
- Der produktive Zielpfad nutzt keine externe WS/Node-Runtime.
- Rendering/OpenGL/UI-Code bleibt außerhalb der reinen State-/Serverlogik.

### Reuse-Bewertung

- Hoch wiederverwendbar:
  - server/uai_types.pas
  - server/uai.pas
  - ai/ai.lpr
  - units/uatomic_field.pas (State-/Move-Logik)
- Mittel (als Referenz/Teilreuse):
  - ai/uatomicai.pas (bestehende prozedurale Regeln)
- Niedrig/keine Wiederverwendung im Ziel:
  - ai_1 WebSocket-Stack
  - ai_1/aiTypescript Produktionscode

### Risiken aus der Analyse

1. Falsche Diskretisierung kontinuierlicher Positionen:
- Wenn Beam nur mit trunc(x), trunc(y) arbeitet, entstehen Fehlentscheidungen bei Feldübergängen.

2. Abweichung von Server-Physik:
- Wenn Centering/Epsilon/Kollisionsregeln nicht konsistent mit HandleMovePlayer sind, wirkt die KI „falsch“.

3. Legacy-Koexistenz:
- Der Referenzbestand erhöht Dokumentationsaufwand, muss aber nicht aus dem Repository entfernt werden.

### Ergebnis dieses Schritts

- Der Ist-Zustand ist dokumentiert.
- Der Scope ist klar getrennt in aktiven Zielpfad und Referenzbestand.
- Die Wiederverwendungsbasis für die weiteren Schritte ist festgelegt.

Schritt 1 gilt damit als abgeschlossen.
