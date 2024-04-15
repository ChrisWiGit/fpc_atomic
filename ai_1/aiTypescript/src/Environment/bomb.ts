import { TAiInfo, TAiVector2, TAiBombInfo, TAiField } from "../AiInfoDef"
import { isPowerUpAt, isWalkable } from "../AiInfo"
import Radius from "./radius"

/**
 * Liefert alle Vektoren um die Bombe herum, die zu einem Radius gehören.
 * Der Rückgabewert ist ein Array von Arrays, wobei jedes Array die Vektoren für eine Richtung enthält.
 * Die Reihenfolge der Richtungen sind: Nord, Süd, West, Ost
 * @param bomb 
 * @param aiInfo 
 * @param param2 
 * @returns 
 */
export function getBombBlastRadius(bomb: TAiBombInfo, aiInfo: TAiInfo, {
  stopAtNotBlankFields = false,
  includeEatenPowerUp = false
}): TAiVector2[][] {
  const beams: TAiVector2[][] = Radius.createBeams(bomb.Position, bomb.FlameLength)

  beams.forEach(beam => {
    // von hinten durchgehen
    for (let i = 0; i < beam.length; i++) {
      const field = beam[i]

      if (stopAtNotBlankFields && !isWalkable(aiInfo, field)) {
        if (includeEatenPowerUp && isPowerUpAt(aiInfo, field)) {
          i++;
        }

        beam.splice(i, beam.length - i)
        break
      }
    }
  });

  return beams
}
