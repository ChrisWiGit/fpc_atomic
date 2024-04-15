import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiVector2 } from "../AiInfoDef"
import { playerInfo, playerPosition, hasAbilities, fieldThreats, fieldValue, bombsOfPlayer, AiMoveStateAsString, AiActionAsString, DEAD_VALUE } from "../AiInfo"
import { moveDirections } from "../AiInfo"
import GameState from './GameState'
import SearchBeamBase, { BeamState, Evaluator } from './SearchBeamBase'


export default abstract class SearchBeamSimple extends SearchBeamBase {
    

    constructor(evaluator: Evaluator, gameState: GameState, depth: number) {
        super(evaluator, gameState, depth)
    }

    
    processBeams(beam: BeamState[], newBeam: BeamState[]) {
        for (let currentBeam of beam) {
            let moves = this.getAllPossibleMoveDirections(currentBeam.gameState)

            this.processMoves(moves, currentBeam, newBeam)
        }
    }

    processMoves(moves: AiMoveState[], currentBeam: BeamState, newBeam: BeamState[]) {
        for (let move of moves) {
            const newGameState = this.simulateMove(currentBeam.gameState, move)

            if (!newGameState) {
                console.debug('SearchBeam:processMoves: invalid move', move, currentBeam.gameState.playerPosition())
                continue
            }
            try {
                console.debug('processMove of', AiMoveStateAsString[move])
                console.group('SearchBeam:evaluateMove: move', move, newGameState.playerPosition())

                const score = currentBeam.score + this.evaluateMove(newGameState, move)

                newBeam.push({ gameState: newGameState, score: score, move, action: AiAction.apNone })
            } finally {
                console.groupEnd()
                console.debug('SearchBeam:processMoves: move', move, newGameState.playerPosition())
            }
        }
    }

    simulateMove(gameState: GameState, move: AiMoveState): GameState | null {
        return gameState.move(move)
    }

}