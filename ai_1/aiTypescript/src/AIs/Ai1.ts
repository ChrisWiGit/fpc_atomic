import { DEAD_VALUE } from 'src/AiInfo';
import { AiAction, AiMoveState, TAiCommand, TAiInfo } from '../AiInfoDef';
import GameState from '../SearchBeam/GameState';
import SearchBeam, { Evaluator, BeamState } from '../SearchBeam/SearchBeamBase';
import AiMemory, { AiMemoryEntity, IAiMemory } from './AiMemory';

export const Ai1Abilities = {
  beamDepth: 7
}

export interface AiInterface {
  act(aiInfo: TAiInfo): TAiCommand
}

export default class Ai1 implements Evaluator {
  searchBeam: SearchBeam
  memory: AiMemoryEntity[]
  currentPlayer: number

  constructor(aiInfo: TAiInfo, currentPlayer: number) {
    const gameState: GameState = GameState.newGamestateFromAiInfoRef(aiInfo, currentPlayer)
    this.searchBeam = new SearchBeam(this, gameState, Ai1Abilities.beamDepth)

    this.memory = AiMemory().getMemory(aiInfo.player)
    this.currentPlayer = currentPlayer
  }

  act(aiInfo: TAiInfo): TAiCommand {
    const backupPlayerPosition = { ...aiInfo.PlayerInfos[aiInfo.player].Position }
    const gameState: GameState = GameState.newGamestateFromAiInfoRef(aiInfo, this.currentPlayer)
    const beamState: BeamState | null = this.searchBeam.run()

    // restore
    aiInfo.PlayerInfos[aiInfo.player].Position = backupPlayerPosition

    return {
      MoveState: beamState?.move ?? AiMoveState.amNone,
      Action: beamState?.action ?? AiAction.apNone
    }
  }

  evaluateMove(gameState: GameState, move: AiMoveState): number {
    if (move === AiMoveState.amNone && gameState.isImmediateLifeThreatening(gameState.playerPosition())) {
      console.debug('SearchBeam:evaluateMove: no move and immediate life threatening', move, gameState.playerPosition())
      // verhindert, dass der Spieler sich nicht bewegt, wenn er in Lebensgefahr ist
      return DEAD_VALUE - 1
    }

    if (gameState.isImmediateLifeThreatening(gameState.playerPosition())) {
      console.debug('SearchBeam:evaluateMove: immediate life threatening', move, gameState.playerPosition())
      // wenn der Spieler sich in Lebensgefahr befindet für den nächsten Zug, dann ist der Zug ungültig
      return DEAD_VALUE
    }
    /*
    TODO:
    1. powerUps einsammeln
    2. steine zerstören
    3. bomben legen
    
    */
    // zahl zwischen -100 und 100
    return Math.random() * 200 - 100
  }
}