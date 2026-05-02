## Schritt 2: Zielarchitektur festlegen (Phase A, Basis)

Status: Erledigt  
Datum: 2026-04-30  
Abhängigkeit: Schritt 1 abgeschlossen

### Ziel von Schritt 2
Die Zielarchitektur der neuen Pascal-AI-DLL verbindlich festlegen, sodass der bestehende Server ohne Interface-Änderung weiterläuft und die spätere Beam-Logik sauber integrierbar ist.

### Architekturentscheidung
Die neue KI bleibt eine native Lazarus/FreePascal-DLL mit unverändertem externem Vertragsmodell.  
Die DLL kapselt intern einen Agent-Layer, der später den Beam-Core aufruft, aber nach außen exakt dieselben Exportfunktionen bereitstellt wie bisher.

### Verbindlicher Exportvertrag (unverändert)
Folgende Exports bleiben identisch in Name, Signatur und Calling Convention:

1. AiInit  
2. AiDeInit  
3. AiInterfaceVersion  
4. AiVersion  
5. AiNewRound  
6. AiHandlePlayer

Konsequenz:
- Keine Anpassung am dynamischen Laden im Server nötig.
- Keine Änderung am bestehenden Command- und Datentyp-Vertrag nötig.
- Rollout kann als Drop-in-Replacement erfolgen.

### Interner Schichtenschnitt der neuen DLL

1. DLL-Entry-Schicht
- Enthält nur Exportfunktionen und minimale Lifecycle-Logik.
- Verantwortlich für Initialisierung, Versionsangaben und Übergabe an Agent-Layer.

2. Agent-Layer
- Orchestriert pro Tick die Entscheidungsfindung.
- Nimmt TAiInfo entgegen und liefert TAiCommand zurück.
- Hält keine unnötigen globalen Zustände zwischen Runden.

3. Adapter-Schicht
- Übersetzt TAiInfo in internes State-Modell für die Planung.
- Bereitet Spielzustand für den späteren Beam-Core auf.
- Muss Powerups, Krankheitsfelder und verfügbare Spielerfähigkeiten vollständig in ein internes Planungsmodell überführen.

4. Planning-Core (in Schritt 3+)
- Eigenständige, testbare Logik.
- Wird vom Agent-Layer aufgerufen, bleibt aber DLL-unabhängig.
- Muss später Powerups nach Nutzen und Risiko unterscheiden, Krankheitsfelder vermeiden und Spezialfähigkeiten über generische Actions einplanen können.

### Nicht-Ziele in Schritt 2
- Noch keine Implementierung der Beam-Suche.
- Noch keine endgültige Heuristik-Definition.
- Keine Legacy-Abschaltung des WebSocket/TypeScript-Pfads vorgesehen; Altcode bleibt als Referenzbasis erhalten.

### Technische Leitplanken
- Calling Convention bleibt cdecl.
- Interface-Version muss mit Serverprüfung kompatibel bleiben.
- Fehler in der Planung dürfen keinen DLL-Crash auslösen; Fallback muss always-safe sein (z. B. neutraler Command).
- Schwierigkeitseinstellung wird weiterhin über AiNewRound(Strength) eingespeist und später auf Beam-Parameter gemappt.
- Externe DLL-API wird nicht für einzelne Fähigkeiten erweitert; `Kick`, `Spooger`, `Punch` und `Trigger` müssen intern auf bestehende Move-/Action-Kommandos abbildbar bleiben.
- Das interne Zustandsmodell muss gute und schlechte Zielkacheln unterscheiden können, damit Powerups geholt und Krankheiten gemieden werden können.
- `Strength` wird in der ersten Fassung linear auf mehrere interne Parameter abgebildet und beeinflusst nicht nur die Tiefe, sondern auch Breite und Risikoprofil.
- Gute Powerups verwenden eine gemeinsame Basis-Gewichtung pro Typ; Profile dürfen diese Basis später abschwächen oder einzelne Typen ignorieren.
- Die erste Beam-Version darf statistisch gute Fluchtwege akzeptieren, statt ausschließlich garantiert sichere Escape-Pfade zu verlangen.
- Die erste Beam-Version bleibt defensiv; aktive Spezialfähigkeitsnutzung und offensivere Bombenplanung folgen erst nach der stabilen Basis.

### Akzeptanzkriterien für Schritt 2
1. Zielarchitektur schriftlich beschlossen (dieses Dokument).
2. Exportvertrag als unveränderlich definiert.
3. Interner Schichtenschnitt eindeutig beschrieben.
4. Klare Übergabe an Schritt 3 (Beam-Core als entkoppelte API) hergestellt.
5. Vorbereitung für Powerup-Bewertung, Krankheitsvermeidung und Spezialfähigkeiten architektonisch berücksichtigt.

### Ergebnis
Die Architektur-Basis ist fixiert:  
Drop-in-kompatible Pascal-DLL außen, modularer Agent/Adapter/Planning-Aufbau innen.  
Damit ist die Grundlage für die entkoppelte Beam-Core-Implementierung in den Folgeschritten gelegt, einschließlich späterer Unterstützung für Powerups, Krankheitsvermeidung und Spezialaktionen ohne Änderung des Exportvertrags.

### Konkretisierte Erstversion
- `Strength` beeinflusst linear Tiefe, Breite und Risikoverhalten des Beams.
- Powerups werden pro Typ über eine gemeinsame Basis-Tabelle im Code gewichtet.
- Gute Ziele dürfen über statistisch günstige Fluchtwerte bewertet werden; perfekte Sicherheit ist nicht zwingend.
- Die erste lauffähige Version bleibt defensiv und konzentriert sich auf Überleben und Stabilität.

