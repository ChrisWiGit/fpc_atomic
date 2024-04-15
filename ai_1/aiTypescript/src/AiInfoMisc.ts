import { AiAction, AiMoveState, TAiBombInfo, TAiCommand, TAiField, TAiInfo, TAiPlayerInfo, TAiVector2, TAiAbilities }
  from "./AiInfoDef"




/**
 * Diese Methode berechnet die Bewegungsrichtung, die der Spieler ausführen soll, um sich in der Zelle zu zentrieren.
 * Der Epsilon-Wert bestimmt die Genauigkeit der Zentrierung. Standardwert: 0.125. Wenn er zu groß ist, kann es zu unerwünschten Bewegungen,
 * wie Schwingungen, kommen. Wenn er zu klein ist, kann es passieren, dass der Spieler sich nicht zentriert.
 * 
 * @param {TAiPlayerInfo} player Der Spieler, dessen Position zentriert werden soll.
 * @param {number} epsilon Der Wert, der die Genauigkeit der Zentrierung bestimmt. Standardwert: 0.125
 * Wenn der Dezimalteil der aktuellen Position innerhalb der Zelle größer als epsilon ist, wird eine Bewegung in die entsprechende Richtung zurückgegeben.
 * Andernfalls wird AiMoveState.amNone zurückgegeben. 
 * @returns {AiMoveState} Die Bewegungsrichtung, die der Spieler ausführen soll, um sich in der Zelle zu zentrieren.
 */
export function centerOnField(player: TAiPlayerInfo, epsilon: number = 0.125): AiMoveState {
  // Berechne den Dezimalteil der aktuellen Position innerhalb der Zelle
  const decimalPartX = player.Position.x - Math.floor(player.Position.x);
  const decimalPartY = player.Position.y - Math.floor(player.Position.y);

  // Bestimme die Bewegungsrichtung basierend auf der Position relativ zum Zentrum der Zelle (0.5, 0.5)
  if (Math.abs(decimalPartX - 0.5) > epsilon) {
    if (decimalPartX < 0.5) {
      return AiMoveState.amRight; // Bewege dich nach rechts, um näher an das Zentrum zu kommen
    }

    return AiMoveState.amLeft; // Bewege dich nach links
  }

  if (Math.abs(decimalPartY - 0.5) > epsilon) {
    if (decimalPartY < 0.5) {
      return AiMoveState.amDown; // Bewege dich nach unten
    }
    
    return AiMoveState.amUp; // Bewege dich nach oben
  }

  // Wenn die KI bereits nahe genug am Zentrum ist, wird keine Bewegung benötigt
  return AiMoveState.amNone;
}
