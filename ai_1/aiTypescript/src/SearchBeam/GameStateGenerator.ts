import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiBombInfo, TAiPlayerInfo, TMessageType, 
  PlayerInfosArray, FieldType,
  fieldHeight, fieldWidth, maxPlayerCount } from "../AiInfoDef"
import GameState from "./GameState"

export default {
  newTAiPlayerInfo() : TAiPlayerInfo {
    return {
      Team: 0,
      Position: { x: 0, y: 0 },
      Alive: false,
      Flying: false,
      FlameLength: 3,
      AvailableBombs: 1,
      Speed: 1,
      Abilities: 0,
    }

  },
  newField() : FieldType {
    const result = new Array(fieldWidth) as [[TAiField]];
    for (let x = 0; x < fieldWidth; x++) {
      result[x] = new Array(fieldHeight) as [TAiField];
      for (let y = 0; y < fieldHeight; y++) {
        result[x][y] = TAiField.fBlank
      }
    }
    return result as any;
  },
  newTAiBombInfo(overwrite: TAiBombInfo | {} = {}) : TAiBombInfo {
    return {
      Position: { x: 0, y: 0 },
      FlameLength: 3,
      Flying: false,
      Owner: 0,
      ManualTrigger: false,
      Jelly: false,
      DudBomb: false,
      ...overwrite
    }
  },

  newTAiInfo(aiInfo: TAiInfo | {} = {}) : TAiInfo {
    const anyNumberOfBombs = 10;
    
    return {
      type: TMessageType.Update,
      player: 0,
      Teamplay: false,
      Field: this.newField(),
      PlayerInfos: new Array(maxPlayerCount).fill({}).map(() => this.newTAiPlayerInfo()) as any,
      Bombs: new Array(anyNumberOfBombs).fill({}).map(() => this.newTAiBombInfo()) as any,
      // Absichtlich 0, da es nicht verwendet wird
      BombsCount: 0,
      ...aiInfo
    } as TAiInfo
  },
  newGameState(aiInfo: TAiInfo | {}= {}) : GameState{
      const result = GameState.newGamestateFromAiInfoRef(this.newTAiInfo(aiInfo), 0)

      return result;
  }

}