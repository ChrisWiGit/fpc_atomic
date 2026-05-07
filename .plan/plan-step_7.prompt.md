## Schritt 7: DLL-Integration (Phase F)

Status: Erledigt  
Datum: 2026-04-30  
Abhaengigkeit: Schritt 6 abgeschlossen

### Ziel von Schritt 7
Die fertige Beam-Logik wird in den DLL-Exportvertrag eingehaengt. AiHandlePlayer ruft Beam-Core ueber Adapter auf; AiNewRound mappt Strength auf Beam-Konfiguration. Der externe Vertrag bleibt unveraendert.

### Verbindlicher Exportvertrag (unveraendert)

```pascal
Procedure AiInit(); cdecl;
Procedure AiDeInit(); cdecl;
Function  AiInterfaceVersion(): uint32; cdecl;
Function  AiVersion(): PChar; cdecl;
Procedure AiNewRound(Strength: uint32); cdecl;
Function  AiHandlePlayer(PlayerIndex: uint32; Const AiInfo: TAiInfo): TAiCommand; cdecl;
```

Kein neuer Export. Keine Signaturaenderung.

### Mapping AiNewRound -> TBeamConfig

```
Strength 0-33   -> bdEasy
Strength 34-66  -> bdNormal
Strength 67-100 -> bdHard
```

Alternativ: bdCustom fuer Spezialwerte ausserhalb 0-100 reservieren.

AiNewRound speichert die Config global im Agent-Layer ab und gibt sie pro AiHandlePlayer-Aufruf weiter.

### Ablauf AiHandlePlayer

1. TBeamInputState erzeugen via Adapter (Schritt 4).
2. Aktuelle TBeamConfig aus globalem Agent-Layer lesen.
3. Optional: OpponentPlans intern vorberechnen (Schritt 3, beam_opponent_model).
4. BeamPlanNextMove aufrufen.
5. TBeamDecision.Command als TAiCommand zurueckgeben.
6. Im Fehlerfall: sicherer Fallback-Command (amNone / apNone).

### Lifecycle-Regeln

1. AiInit
- Interne Strukturen initialisieren.
- Keine externe Ressource oeffnen.

2. AiDeInit
- Interne Strukturen freigeben.
- Kein Crash bei mehrfachem Aufruf.

3. AiNewRound
- Config neu setzen.
- Zustand aus Vorrunde verwerfen.

4. AiHandlePlayer
- Kein persistenter Zustand zwischen Aufrufen noetig (Beam ist zustandslos).
- Aufruf muss pro Frame ohne Fehler abschliessen.

### Fehler- und Fallbackverhalten

1. Wenn Adapter keinen gueltigen State liefert -> amNone zurueckgeben.
2. Wenn Beam-Budget ohne Ergebnis laeuft -> bisher besten Kandidaten nehmen.
3. Wenn kein Kandidat vorhanden -> amNone.
4. Alle Fehler werden in TBeamDebugInfo protokolliert (FallbackUsed = True).

### Akzeptanzkriterien

1. Alle sechs Exports sind vorhanden und korrekt signiert.
2. AiNewRound mappt Strength auf TBeamConfig.
3. AiHandlePlayer ruft Adapter + BeamPlanNextMove auf.
4. Kein Crash bei AiDeInit / DLL-Unload.
5. Fallback-Command wird bei Fehler zuverlassig geliefert.
6. Server laedt DLL ohne Aenderung am Lademechanismus.

### Ergebnis
Die DLL-Integration ist abgeschlossen. Der Agent ist als Drop-in fuer den bestehenden Server einsetzbar.
