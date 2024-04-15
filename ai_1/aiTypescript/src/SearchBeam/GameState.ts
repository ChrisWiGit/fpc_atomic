import { AiAction, AiMoveState, TAiAbilities, TAiCommand, TAiField, TAiInfo, TAiVector2, fieldHeight, fieldWidth } from "../AiInfoDef"
import { playerInfo, playerPosition, hasAbilities, fieldThreats, fieldValue, bombsOfPlayer } from "../AiInfo"
import GameStateGenerator from "./GameStateGenerator"
import vector from "../Environment/vector"
import Cloneable from "src/Cloneable"
import Assignable from "src/Assignable"

class GameState implements Cloneable<GameState>, Assignable<GameState> {
  aiInfo: TAiInfo
  currentPlayer: number
  moveVector: { [key: number]: (v: TAiVector2) => TAiVector2 }

  private constructor(currentGameState: GameState | null, currentPlayer: number = NaN) {
    this.aiInfo = this.deepCopy(currentGameState?.aiInfo)
    this.currentPlayer = currentGameState?.currentPlayer ?? NaN
    this.moveVector = {}

    this.init(currentPlayer)
  }
  
  static newGamestateFromAiInfoRef(aiInfoRef: TAiInfo, currentPlayer: number = NaN): GameState {
    const newGameState = new GameState(null, currentPlayer)
    newGameState.aiInfo = aiInfoRef
    newGameState.init(currentPlayer)
    return newGameState
  }

  static newGameStateFromGameState(gameState: GameState): GameState {
    return new GameState(gameState)
  }

  private deepCopy(value: any | undefined): any {
    return value ? JSON.parse(JSON.stringify(value)) : null
  }

  clone(): GameState {
    return GameState.newGameStateFromGameState(this)
  }

  assignFrom(other: GameState): GameState {
    if (!other) {
      return this
    }
    this.aiInfo = this.deepCopy(other.aiInfo)
    this.currentPlayer = other.currentPlayer
    this.moveVector = this.deepCopy(other.moveVector)
    return this
  }

  private init(currentPlayer: number = NaN) {
    this.currentPlayer = Number.isInteger(currentPlayer) ? currentPlayer : this.currentPlayer ?? NaN

    this.moveVector = {
      [AiMoveState.amLeft]: vector.stepLeft,
      [AiMoveState.amRight]: vector.stepRight,
      [AiMoveState.amUp]: vector.stepUp,
      [AiMoveState.amDown]: vector.stepDown,
      [AiMoveState.amNone]: vector.identity
    }

    if (this.aiInfo?.BombsCount <= 0) {
      this.aiInfo.Bombs = []
    }
  }

  move(move: AiMoveState): GameState {
    const state = new GameState(this, this.currentPlayer)

    const oldPlayerPosition = this.aiInfo.PlayerInfos[this.currentPlayer].Position

    state.aiInfo.PlayerInfos[this.currentPlayer].Position = state.moveVector[move](oldPlayerPosition)


    return state;
  }

  plantBomb(): GameState {
    const result = new GameState(this, this.currentPlayer)
    const newBomb = GameStateGenerator.newTAiBombInfo()

    newBomb.Position = this.playerPosition()
    newBomb.Owner = this.currentPlayer
    newBomb.FlameLength = playerInfo(this.aiInfo, this.currentPlayer).FlameLength
    newBomb.ManualTrigger = hasAbilities(this.aiInfo, this.currentPlayer, TAiAbilities.Ability_CanTrigger)
    newBomb.Jelly = hasAbilities(this.aiInfo, this.currentPlayer, TAiAbilities.Ability_CanJelly)
    // ignorieren wir erstmal
    newBomb.DudBomb = false

    result.aiInfo.Bombs.push(newBomb);
    result.aiInfo.BombsCount += 1;

    return result
  }
  canPlantBomb(): boolean {
    return this.aiInfo.PlayerInfos[this.currentPlayer].AvailableBombs > 0 &&
      // aktuelle position hat keine bombe
      this.aiInfo.Bombs.filter(bomb => vector.equals(bomb.Position, this.playerPosition())).length === 0
  }

  /**
   * Für diese Position ist das Leben bedrohlich.
   * D.h. wenn der Spieler sich hier hin bewegt, stirbt er.
   * Aktuell liegt das daran, dass hier eine Flamme ist.
   * @param {TAiVector2} position  Position, die geprüft werden soll.
   * @returns {boolean} true, wenn für das Leben bedrohlich ist.
   */
  isImmediateLifeThreatening(position: TAiVector2): boolean {
    return fieldValue(this.aiInfo, position.x, position.y) === TAiField.fFlame;
  }


  action(action: AiAction): GameState {
    return new GameState(this, this.currentPlayer)
  }

  isValidMove(move: AiMoveState): boolean {
    const oldPlayerPosition = this.aiInfo.PlayerInfos[this.currentPlayer].Position
    const newPlayerPosition = this.moveVector[move](oldPlayerPosition)
    const fieldType = fieldValue(this.aiInfo, newPlayerPosition.x, newPlayerPosition.y);

    if (fieldType == null || fieldType === TAiField.fSolid || fieldType === TAiField.fBrick) {
      return false
    }

    return vector.inBounds(newPlayerPosition, 0, 0, fieldWidth, fieldHeight)
  }

  isPlayerAlive(): boolean {
    return this.aiInfo.PlayerInfos[this.currentPlayer].Alive
  }

  isPlayerFlying(): boolean {
    return this.aiInfo.PlayerInfos[this.currentPlayer].Flying
  }

  playerPosition(player: number = NaN): TAiVector2 {
    return playerPosition(this.aiInfo, Number.isInteger(player) ? player : this.currentPlayer)
  }
}

export default GameState