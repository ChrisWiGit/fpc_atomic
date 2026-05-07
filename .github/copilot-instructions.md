# Copilot Instruction

## Beschreibung

Es soll ein KI für das Spiel FPC Atomic Bomberman erstellt werden.

Der Plan dazu ist unter .plan zu finden.

Die Sprache ist Pascal bzw. Lazarus.

## Bezug

Diese Instruktionen beziehen sich auf den Ordner ai\ und darunter liegenden Dateien.


## Tests

Es gibt einen Testordner ai\tests\ mit einem Testprogramm ai_tests.lpr, das mit FPCUnit erstellt wurde. Es soll die Funktionalität der KI testen.

### Build

Erstellt die KI-Bibliothek:

```
make build
```

### Ausführen

Erstellt die Tests und führt sie aus:

```
make test
```

### Alles

Erstellt die KI, dann die Tests und führt sie aus:

```
make all
```


## Code Style

* 6 Spaces für Einrückungen verwenden, keine Tabs
* englische Kommentare, aber nur, um die Funktionalität zu erklären, nicht um den Code zu beschreiben
* Guard clauses verwenden, um die Lesbarkeit zu verbessern
* Trennung von Verantwortlichkeiten: Funktionen sollten nur eine Aufgabe haben
* Vermeidung von globalen Variablen, stattdessen Parameter und Rückgabewerte verwenden
* Dependency Injection verwenden, um die Testbarkeit zu verbessern
* Verhalten durch Polymorphismus implementieren, anstatt von if-else oder switch-case Anweisungen
* Einhaltung von SOLID-Prinzipien, um die Wartbarkeit und Erweiterbarkeit des Codes zu verbessern
* TMyObject.Create() nur über Factory-Methoden/Klassen aufrufen, um die Kontrolle über die Erstellung von Objekten zu behalten
* Konstruktoren sollten keine Logik enthalten, die fehlschlagen könnte, sondern nur die Initialisierung von Feldern durchführen

## Style

```pascal
if (condition) then
begin
  // code
end
else if (other_condition) then
begin
  // code
end;
```