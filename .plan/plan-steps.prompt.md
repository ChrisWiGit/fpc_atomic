## Plan: Migration auf Pascal Beam DLL

Ziel ist die Ablösung der TypeScript/WebSocket-Kette durch eine native Lazarus-DLL in Pascal, die direkt das bestehende AI-DLL-Interface nutzt und eine separat testbare Beam-API bereitstellt. Vorhandene Engine-Datenstrukturen und Bewegungsregeln aus dem Server/Units-Code werden wiederverwendet; Rendering/OpenGL bleibt explizit außerhalb des Scopes.

**Steps**

1. Ist-Zustand dokumentieren und Scope schneiden: Bestand in `ai/`, `ai_1/`, `ai_1/aiTypescript/`, `server/`, `units/` erfassen; WebSocket/Node-Pfad als Referenzpfad dokumentieren. Ergebnis ist eine klare Include/Exclude-Liste für Migration. 
   * **Done in [plan-step_1.prompt.md](./plan-step_1.prompt.md).**
2. Zielarchitektur festlegen (_Phase A, Basis_): neues DLL-Projekt als Nachfolger von `ai/` mit identischen Exports (`AiInit`, `AiDeInit`, `AiInterfaceVersion`, `AiVersion`, `AiNewRound`, `AiHandlePlayer`) und internem Agent-Layer definieren. _depends on 1_
   * **Done in [plan-step_2.prompt.md](./plan-step_2.prompt.md).**
3. Beam-Core als eigenständige Pascal-API designen (_Phase B, entkoppelt_): reines Planungsmodul ohne DLL- oder Server-Abhängigkeit mit klaren Inputs (State Snapshot + PlayerIndex + Config) und Output (`TAiCommand`, optional Bewertungs-/Debugdaten). _depends on 2_
   * **Done in [plan-step_3.prompt.md](./plan-step_3.prompt.md).**
4. Spielzustands-Adapter bauen (_Phase C, Engine-Reuse_): Adapter von `TAiInfo` auf Beam-internes Zustandsmodell inkl. Feldbelegung, Bomben, Gegnern, Fähigkeiten, Powerup-Klassen und negativen Feldern wie Krankheiten. Dabei floatende Positionen korrekt diskretisieren und zugleich als Continuous-Infos für Feinnavigation verfügbar halten. _depends on 3_
   * **Done in [plan-step_4.prompt.md](./plan-step_4.prompt.md).**
5. Bewegungsmodell übernehmen (_Phase D, kritisch_): Übergangsregeln zwischen Tiles aus Serverlogik reproduzieren (Centering auf `.5`, Richtungswechsel an Kachelgrenzen, Epsilon-Korridor). Dadurch verhindert man KI-Entscheidungen, die nur auf ganzzahligen Koordinaten korrekt wären. _depends on 4_
   * **Done in [plan-step_5.prompt.md](./plan-step_5.prompt.md).**
6. Beam-Entscheidungslogik implementieren (_Phase E_):
   - Kandidatenzug-Generator für `amNone/amLeft/amRight/amUp/amDown` plus optionale Action-Entscheidung (`apFirst`, `apSecond` etc.)
   - Vorwärtssimulation mit Gefahrbewertung (Flammen/Bomben), Überlebenspriorität, danach Ziel-/Offensivheuristiken
   - Bewertung von Powerups nach Nutzen, Erreichbarkeit und Risiko; schlechte Felder wie Krankheiten nach Möglichkeit vermeiden
   - Vorbereitung spezieller Fähigkeitsnutzung über generische Actions (`Kick` indirekt über Bewegung, `Spooger`, `Punch`, `Trigger` über Aktionsplanung)
   - Schwierigkeit über `AiNewRound(Strength)` linear auf mehrere Parameter gleichzeitig mappen: Beam-Länge, Beam-Breite und Risikobereitschaft
     _depends on 5_
   * **Done in [plan-step_6.prompt.md](./plan-step_6.prompt.md).**
7. DLL-Integration (_Phase F_): `AiHandlePlayer` ruft Beam-Core über Adapter auf; `AiNewRound(Strength)` mappt auf Beam-Konfiguration (Länge/Breite/Timeouts). Bestehenden Exportvertrag unverändert lassen. _depends on 6_
   * **Done in [plan-step_7.prompt.md](./plan-step_7.prompt.md).**
8. Testbarkeit sicherstellen (_parallel mit 6/7, dann finalisieren_):
   - Beam-Core Unit-Tests mit synthetischen States
   - Replay-/Golden-Tests mit serialisierten `TAiInfo`-Snapshots aus Realspielen
   - Contract-Tests für DLL-Exports gegen `server/uai.pas`
   * **Done in [plan-step_8.prompt.md](./plan-step_8.prompt.md).**
9. Legacy-Pfad als Referenzbasis beibehalten (_Phase G, nach Stabilität_): `ai_1` WebSocket-Server und `ai_1/aiTypescript` bleiben im Repository als Ideen-/Vergleichsbasis erhalten; nur Dokumentation zur aktiven vs. referenzierten Nutzung schärfen. _depends on 7,8_
10. Analyse-Dokument im Workspace ablegen: `.plan/ai-migration-analysis.md` erzeugen (Executive Summary, Reuse-Matrix, Risiken, Migrationspfad, Teststrategie). _depends on 1-9_

**Relevant files**

- `d:/Projekte/fpc_atomic2/ai/ai.lpr` — bestehender DLL-Einstieg mit finalem Exportvertrag; Ziel ist Weiterverwendung statt Neu-Erfindung.
- `d:/Projekte/fpc_atomic2/ai/uatomicai.pas` — bestehende prozedurale KI-Logik (Escape/Navigation), nützliche Heuristik-Referenz.
- `d:/Projekte/fpc_atomic2/ai_empty/ai.lpr` — Minimaltemplate für sehr schlanken DLL-Start.
- `d:/Projekte/fpc_atomic2/server/uai_types.pas` — kanonische AI-Datentypen (`TAiInfo`, `TAiCommand`, Position/Feld/Bomben).
- `d:/Projekte/fpc_atomic2/server/uai.pas` — dynamisches Laden/Contract-Prüfung (Interface-Version).
- `d:/Projekte/fpc_atomic2/server/uatomic_server.pas` — AI-Aufrufzyklus pro Frame und Mapping der `TAiCommand`-Enums auf Serverbewegung.
- `d:/Projekte/fpc_atomic2/units/uatomic_field.pas` — entscheidende Simulations- und Bewegungslogik (`HandleMovePlayer`, `HandleBombs`, `GetAiInfo`) inkl. floatender Tile-Übergänge.
- `d:/Projekte/fpc_atomic2/units/uatomic_common.pas` — Feld-/Timing-/Geschwindigkeitskonstanten (`FieldWidth`, `FieldHeight`, `FrameRate`, Geschwindigkeiten).
- `d:/Projekte/fpc_atomic2/ai_1/ai.lpr` — WebSocket-Bridge-DLL; zeigt Overhead und DeInit-/Unload-Problematik.
- `d:/Projekte/fpc_atomic2/ai_1/aicommserver.pas` — Threaded WS-Server mit JSON/Binary-Protokoll, Kandidat für vollständige Ablösung.
- `d:/Projekte/fpc_atomic2/ai_1/AiInfoJson.pas` — JSON-Serialisierung des `TAiInfo`; nur relevant für Legacy-Bridge.
- `d:/Projekte/fpc_atomic2/ai_1/aiTypescript/src/SearchBeam/GameState.ts` — TS-Prototyp für State-Manipulation; algorithmische Ideen nutzbar, Codebasis nicht produktionsreif.
- `d:/Projekte/fpc_atomic2/ai_1/aiTypescript/src/SearchBeam/searchBeam.ts` — unvollständige Beam-Implementierung; dient höchstens als Konzeptskizze.

**Verification**

1. Build-Verifikation DLL: Projekt kompiliert als `Library`, Exports exakt vorhanden, `AiInterfaceVersion` passt zur Server-Erwartung.
2. Laufzeit-Verifikation im Server: AI wird geladen, `AiHandlePlayer` wird zyklisch aufgerufen, keine Crashes bei `AiDeInit`/Unload.
3. Bewegungs-Korrektheit: Tests für Grenzfälle beim Tile-Übergang (kurz vor/nach 0.5), Corner-Cases an Ecken/Blockern/Bomben.
4. Entscheidungsqualität: deterministische Szenariotests (Flucht vor Bombe, Bomb-Placement nur bei Escape-Pfad, Gegnerdruck).
5. Powerup-/Krankheitsverhalten: Tests dafür, dass nützliche Powerups nur bei vertretbarem Risiko priorisiert und Krankheitsfelder wenn möglich vermieden werden.
6. Spezialfähigkeiten: Testszenarien für spätere Nutzung von `Kick`, `Spooger`, `Punch` und `Trigger` über die bestehende Command-Abbildung vorbereiten.
7. Schwierigkeitsskala: messbarer Unterschied zwischen Beam-Längenprofilen (z. B. Überlebensrate/Entscheidungsstabilität pro Profil).
8. Legacy-Koexistenz: Nachweis, dass neue DLL produktiv funktionsfähig ist, während `ai_1`/TypeScript-Code als Referenz im Repository bestehen bleibt.

**Decisions**

- Enthalten: rein prozedurale, nicht-trainierende KI mit Beam-Planung in Pascal.
- Enthalten: Beam-Länge/-Breite als primäre Difficulty-Steuerung über `AiNewRound(Strength)`.
- Enthalten: separate, testbare Beam-API (Core + Adapter), damit unabhängig von DLL getestet werden kann.
- Enthalten: explizite Vorbereitung für Powerup-Differenzierung, Krankheitsvermeidung und spätere Nutzung spezieller Fähigkeiten innerhalb der bestehenden `TAiCommand`-API.
- Enthalten: erste Version mit defensivem Verhalten, statistischer Fluchtbewertung und Fokus auf Stabilität statt früher Offensivlogik.
- Ausgeschlossen: Tensor-/ML-Training, externe WS/Node-Runtime, UI-/OpenGL-spezifische Clientlogik.
- Ausgeschlossen: vollständige Wiederverwendung des aktuellen TS-SearchBeam-Codes als Produktionscode; stattdessen selektive Übernahme von Ideen/Tests.

**Further Considerations**

1. Schwierigkeit-Mapping: festgelegt auf lineare Abbildung von `Strength` auf Tiefe, Breite und Risiko-Verhalten.
2. Simulations-Tiefe pro Tick: Option A fixes Zeitbudget, Option B fixes Nodebudget, Option C adaptiv nach Spielphase. Empfehlung: B zuerst (reproduzierbar), später C.
3. Powerup-Modell: festgelegt auf gemeinsame Basis-Gewichtung pro Powerup-Typ im Code; Profile dürfen diese Basis später skaliert oder selektiv abschwächen.
4. Fluchtkriterium: festgelegt auf statistisch guten Fluchtweg statt nur garantiertem Escape-Pfad.
5. Spezialfähigkeiten: Architektur vorbereiten, aber erste lauffähige Version nutzt sie noch nicht aktiv; defensives Verhalten reicht zunächst aus.
6. Dateiablage Analyse: Nutzerwunsch ist `.plan`-Ordner im Workspace; operative Umsetzung sollte `.plan/ai-migration-analysis.md` als dauerhaftes Artefakt anlegen.

**Strength-Profil-Tabelle (Startwerte, fuer Schritt 7 Mapping)**

Die erste Version nutzt ein bereichsbasiertes Profilmodell mit optionaler linearer Interpolation zwischen den Stützpunkten. Diese Tabelle definiert die Beam-Search-Konfiguration; die Powerup-Konfiguration wird separat gehalten, damit spätere Policy-Implementierungen austauschbar bleiben.

| Strength-Bereich | BeamTiefe | BeamTiefeJitter | BeamBreite | RisikoGewicht | KrankheitsMalus | BombenAggressivitaet |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 0-33 | 5 | ±2 | 24 | 1.8 | 3.0 | 0.2 |
| 34-66 | 8 | ±2 | 48 | 1.2 | 2.2 | 0.4 |
| 67-100 | 11 | ±2 | 80 | 0.9 | 1.6 | 0.6 |

Definitionen:
- `RisikoGewicht`: Multiplikator fuer Gefahrenkosten (hoeher = vorsichtiger).
- `KrankheitsMalus`: Zusatzmalus fuer negative Felder (`fSlow`, `fDisease`, `fBadDisease`, ggf. `fRandom`).
- `BombenAggressivitaet`: Gewicht fuer offensive Bombenentscheidungen (in der ersten Version nur defensiv wirksam).
- `BeamTiefeJitter`: zufälliger Offset, der gelegentlich zur maximalen Suchtiefe addiert oder subtrahiert wird. Dies sorgt für mehr Variation und verhindert zu deterministisches Verhalten.
- `BeamBreite`: Anzahl der besten Kandidaten, die in jeder Suchstufe weiterverfolgt werden. Größere Werte erlauben eine breitere Suche; kleinere Werte reduzieren die Laufzeit und machen die KI fokussierter.

**Powerup-Konfiguration (separate Tabelle / separater Policy-Typ)**

Die Powerup-Logik sollte unabhängig von der Beam-Konfiguration bleiben, damit spätere Änderungen über neue Implementierungen oder Dateilade-Mechanismen erfolgen können.

Beispielelemente:
- `PowerupChancePerType`: Wahrscheinlichkeit, dass ein Powerup-Typ als Ziel in die Suche aufgenommen wird. Diese Wahrscheinlichkeit kann durch AI-spezifische Faktoren (z.B. Jelly bereits aufgenommen) oder situative Faktoren (z.B. Nähe zu Gegnern) modifiziert oder sogar ignoriert werden.
- `PowerupWeightPerType`: Basisgewicht für die relative Attraktivität eines Items. Kann durch AI-spezifische Faktoren (z.B. bereits vorhandene Fähigkeiten) oder situative Faktoren (z.B. Risiko durch Gegner) modifiziert werden.
- optional: `StrengthModifier`, um die Chance je nach `Strength` anzupassen

Beispielwerte:
- `PowerupChance[fExtraBomb] = 0.90`
- `PowerupChance[fLongerFlame] = 0.80`
- `PowerupChance[fGoldflame] = 0.75`
- `PowerupChance[fExtraSpeed] = 0.65`
- `PowerupChance[fKick] = 0.40`
- `PowerupChance[fSpooger] = 0.30`
- `PowerupChance[fPunch] = 0.30`
- `PowerupChance[fGrab] = 0.20`
- `PowerupChance[fTrigger] = 0.25`
- `PowerupChance[fJelly] = 0.15`

Powerup-Basisgewichte pro Typ:
- `fExtraBomb`: 1.00
- `fLongerFlame`: 0.80
- `fGoldflame`: 1.10
- `fExtraSpeed`: 0.70
- `fKick`: 0.25
- `fSpooger`: 0.15
- `fPunch`: 0.15
- `fGrab`: 0.10
- `fTrigger`: 0.15
- `fJelly`: 0.10

Diese Konfiguration kann später aus einer Datei geladen werden. Die Architektur sollte daher auf Schnittstellen/abstrakte Basisklassen setzen, z. B.:
- `IBeamConfig` / `TBeamConfig`
- `IPowerupPolicy` / `TPowerupPolicy`
- `TDefaultBeamConfig`, `TDefaultPowerupPolicy`
- `TFileBasedBeamConfig`, `TFileBasedPowerupPolicy`

Damit wird es möglich, später neue Implementierungen mit anderen Werten oder Ladeformaten einzuführen, ohne die Beam-Core-Logik zu ändern.

Interpolationsregel (optional, empfohlen):
- Zwischen zwei Bereichen werden Werte linear gemischt, um harte Verhaltensspruenge zu vermeiden.
- Formel: `Wert = WertA + t * (WertB - WertA)`, mit `t` in `[0..1]`.

**Decision Rules (verbindlich fuer Implementierung V1)**

1. Survival-Hard-Filter
   - Es werden nur Kandidaten weiterverfolgt, die nicht unmittelbar in einen tödlichen Zustand führen.

2. Situative Hard-Constraints
   - Harte Verbote/Erzwingungen (z. B. nur ein Fluchtweg, akute Bombengefahr, unpassierbare Felder) werden vor jeder Powerup-Bewertung angewendet.

3. PowerupChance-Gate
   - Pro Powerup-Typ wird zuerst die effektive Chance berechnet.
   - Formel: `P_eff = clamp(P_base * M_strength * M_context, 0, 1)`.
   - Die Entscheidung erfolgt über `IRandom` als Bernoulli-Draw.

4. Scoring
   - Nur Kandidaten, die das Chance-Gate passieren, werden im Score verglichen.
   - `PowerupWeightPerType` wirkt im Scoring als Attraktivitätsfaktor relativ zu anderen Zielen.

5. Deterministischer Tie-Break ersetzt durch 50:50 Zufall
   - Bei exakt gleichem Score wird per `IRandom` mit `50:50` entschieden.
   - Damit bleibt die Entscheidung reproduzierbar testbar, wenn ein deterministischer `IRandom` in Tests injiziert wird.

**Festlegungen aus den offenen Punkten**

- `IRandom` wird per Dependency Injection eingebunden.
- Für Tests sind feste/deterministische `IRandom`-Implementierungen vorgesehen.
- In Produktion wird `IRandom` einmalig beim KI-Start initialisiert (Standard-Lazarus-Randomquelle).
- Dateibasierte Konfiguration (z. B. INI) kommt später als zusätzliche Implementierung hinter Factory-Umschaltung.
- `Strength` wird auf den gültigen Bereich geklemmt; `Strength >= 100` entspricht der stärksten KI.