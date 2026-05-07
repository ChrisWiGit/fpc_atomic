# Ziel des Dokuments
Entwicklung eines leistungsstarken KI-Agenten für das Spiel *Hypersonic* (Bomberman-Variante auf CodinGame) durch Vergleich und Optimierung verschiedener Suchalgorithmen und Systemkomponenten.

---

# Spielbeschreibung (Hypersonic)

## Grundregeln
- Spielfeld: 13×11 Grid
- 2–4 Spieler, simultane Züge
- Zelltypen: frei, Wand (unzerstörbar), Kiste (zerstörbar, enthält Items)
- Aktionen pro Zug:
  - Bewegung: oben, unten, links, rechts, stehen
  - Bombe platzieren (optional)
- Bomben:
  - Explosion nach 8 Turns
  - Reichweite linear (horizontal/vertikal)
  - Kettenreaktionen möglich
- Ziele:
  - Überleben (letzter Spieler gewinnt)
  - Tie-Breaker: zerstörte Kisten
- Items:
  - Mehr Bomben
  - Größere Reichweite

## Spielmechaniken mit Einfluss auf KI
- Vollständige Information (kein Fog of War)
- Gleichzeitige Aktionen → kombinatorische Explosion der Zustände
- Hohe Relevanz von:
  - Positionierung
  - Timing von Bomben
  - Überlebensfähigkeit (Survivability)

---

# Systemarchitektur

## Game Engine Anforderungen
- Generierung legaler Aktionen
- Simulation des nächsten Zustands (inkl. simultaner Aktionen)
- Verwaltung von Spielmetriken
- Hohe Performance entscheidend (Zeitlimit: 100ms/Zug)

## Engine-Optimierung
### Naive Engine
- Standarddatenstrukturen
- Langsame Simulation (~80–90k Aktionen/500ms)

### Bitweise Engine
- Bitmasken + Preprocessing
- Konstantzeit-Operationen (z.B. Explosionen)
- ~15× schneller (~1.3–1.45 Mio Aktionen/500ms)

---

# Zustandsbewertung (Heuristik)

## Ziel
Bewertung nicht-terminaler Zustände zur Steuerung der Suche.

## Komponenten der Evaluationsfunktion
1. Zerstörte Kisten (linear)
2. Bombenreichweite (gewichtete Kombination)
3. Anzahl zusätzlicher Bomben (nichtlinear gewichtet)
4. Diskontierte zukünftige Explosionen:
   - `estimated_bombs(state)` mit γ = 0.95
5. Distanz zu Gegnern (leichte Belohnung)
6. Positionsheuristik:
   - Frühes Spiel: Nähe zum Zentrum
   - Spätes Spiel: Nähe zu Kisten
7. Tod:
   - −1000 Punkte

## Zusatzfunktionen
- `is_survivable(state, player)`
  - BFS bis Tiefe 8
- `can_kill(state, player, enemy)`
  - Exhaustive Suche (2 Züge)
- Fokus: frühzeitiges Pruning nicht überlebbarer Zustände

---

# Gegner-Vorhersage

## Strategie
- Für jeden Gegner:
  - Eigenen Algorithmus kurz ausführen (≈10–15ms)
  - Annahme: andere Spieler bleiben passiv
- Ergebnis:
  - Approximierte Aktionssequenzen
- Verwendung:
  - Eigene Planung berücksichtigt simulierte Gegnerzüge

---

# Vergleich der Algorithmen

## 1. Monte Carlo Tree Search (MCTS)

### Eigenschaften
- Stochastisch, baumbasiert
- UCT-Selektion (c = 1)
- Simulationstiefe: ~15

### Anpassungen
- Single-Player MCTS + Gegner-Vorhersage
- Heuristische Bewertung statt vollständiger Simulation

### Probleme
- Schlechte Gegnerinteraktion
- Schwierige Gewichtung der Heuristik
- Tendenz zu übermäßigem Bombenlegen

---

## 2. Rolling Horizon Evolutionary Algorithm (RHEA)

### Konzept
- Sequenzen von Aktionen = Chromosomen
- Evolution:
  - Selektion (Roulette Wheel)
  - Crossover (1-Punkt)
  - Mutation (p = 0.5)

### Parameter
- Population: 50
- Offspring: 50
- Länge: 17

### Probleme
- Viele ungültige Aktionssequenzen
- Lokale Optima
- Hohe Zufälligkeit
- Effektive Planungstiefe oft reduziert

---

## 3. Beam Search (beste Methode)

### Grundidee
- Breitensuche mit Begrenzung (`beam_width`)
- Auswahl der besten Zustände pro Ebene

### Erweiterungen

#### Zobrist Hashing (ZH)
- Entfernt Duplikate

#### Opponent Prediction (OP)
- Integration von Gegnerverhalten

#### Local Beams (LB)
- Zustände nach Position gruppiert
- Max. `local_beam_width` pro Position

#### First Move Pruning (FMP)
- Entfernt:
  - Nicht überlebbare Züge
  - Suboptimale Züge wenn Kill möglich

#### Survivability Checking (SC)
- Bestraft nicht überlebbare Zustände stark

### Parameter
- `beam_width = 500`
- `local_beam_width = 12`

### Besonderheiten
- Explizites Erzwingen von Selbstopfer-Zügen bei garantiertem Sieg

---

# Ergebnisse

## 1v1 Performance
- Beam Search dominiert:
  - vs MCTS: ~96%
  - vs RHEA: ~99%

## Mehrspieler
- Etwas geringere Dominanz (höhere Unsicherheit)
- Dennoch klar überlegen

## Ranking (CodinGame)
- Beam Search: Platz 1
- MCTS: ~Platz 183
- RHEA: ~Platz 204

---

# Zentrale Erfolgsfaktoren

## Algorithmisch
- Beam Search > MCTS > RHEA
- Fokus auf Planung statt Statistik

## Technisch
- Extrem schnelle Engine (bitwise)
- Effiziente Zustandsrepräsentation

## Heuristik
- Starke Gewichtung von:
  - Überleben
  - Kistenzerstörung
- Diskontierung zukünftiger Rewards

## Pruning
- Frühzeitiges Entfernen schlechter Zustände
- Reduktion des Suchraums entscheidend

## Gegner-Modellierung
- Approximation ausreichend
- Exakte Modellierung zu teuer

---

# Anforderungen für Umsetzung

## Kernkomponenten
- Hochperformante Game Engine (bitbasiert)
- Beam Search mit Erweiterungen:
  - ZH, OP, LB, FMP, SC
- Heuristische Bewertungsfunktion
- Gegner-Simulation

## Optimierungsziele
- Maximale Simulationen pro 100ms
- Minimierung nicht überlebbarer Zustände
- Balance zwischen Exploration und Pruning

## Risiken
- Rechenzeitüberschreitung
- Overfitting der Heuristik
- Instabile Gegnerprognosen

