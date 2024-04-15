import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiVector2 } from "../AiInfoDef"
import { playerInfo, playerPosition, hasAbilities, fieldThreats, fieldValue, bombsOfPlayer, AiMoveStateAsString, AiActionAsString, DEAD_VALUE } from "../AiInfo"
import { moveDirections } from "../AiInfo"
import GameState from './GameState'

export type BeamState = { gameState: GameState, score: number, move: AiMoveState, action: AiAction }

export interface Evaluator {
    evaluateMove(gameState: GameState, move: AiMoveState): number
}
export interface SearchBeam {
    run(): BeamState | null
    simulateMove(gameState: GameState, move: AiMoveState): GameState | null
}

export default abstract class SearchBeamBase implements SearchBeam {
    static DEFAULT_DEPTH: number = 7
    depth: number
    gameState: GameState
    evaluationCounter: number = 0
    evaluator: Evaluator

    getBeamResult(beam: BeamState | null): BeamState | null {
        console.debug('SearchBeam:run ended with', {
            ...beam,
            move: AiMoveStateAsString[beam?.move || AiMoveState.amNone],
            action: AiActionAsString[beam?.action || AiAction.apNone],
        });
        console.dir({ ...beam })

        return beam
    }

    abstract initBeams(): void
    abstract startBeams(): void
    abstract resultBeamsResult(): BeamState | null

    constructor(evaluator: Evaluator, gameState: GameState, depth: number = SearchBeamBase.DEFAULT_DEPTH) {
        this.depth = depth
        this.gameState = gameState
        this.evaluator = evaluator
    }

    run(): BeamState | null {
        console.group('SearchBeam:run')
        console.time('SearchBeam:run')
        console.log('Player:', this.gameState.currentPlayer)
        console.log('Player at:', this.gameState.playerPosition(this.gameState.currentPlayer))
        
        this.evaluationCounter = 0
        try {
            if (!this.gameState.isPlayerAlive() || this.gameState.isPlayerFlying()) {
                console.debug('player is dead or flying. exiting.', !this.gameState.isPlayerAlive(), !this.gameState.isPlayerFlying())
                return null
            }

            this.initBeams()
            this.startBeams()
            return this.getBeamResult(this.resultBeamsResult());
        } finally {
            console.log('Evaluation Counter:', this.evaluationCounter)
            console.timeEnd('SearchBeam:run')
            console.groupEnd()
        }
    }

    simulateMove(gameState: GameState, move: AiMoveState): GameState | null {
        return gameState.move(move)
    }

    evaluateMove(gameState: GameState | null, move: AiMoveState): number {
        this.evaluationCounter++

        console.debug('evaluateMove of', AiMoveStateAsString[move])

        if (gameState === null) {
            console.debug('SearchBeam:evaluateMove: invalid move (gameState === null)', move)
            return DEAD_VALUE
        }
        console.debug('SearchBeam:evaluateMove: move', move, gameState.playerPosition())

        const result = this.evaluator.evaluateMove(gameState, move);

        return result;
    }


    getAllPossibleMoveDirections(gameState: GameState): AiMoveState[] {
        const result: AiMoveState[] = []
        for (const direction of moveDirections) {
            console.debug('SearchBeam:generateMoves: direction', AiMoveStateAsString[direction])
            if (gameState.isValidMove(direction)) {
                result.push(direction)
            }
        }
        if (console.debug) console.debug('SearchBeam:generateMoves', result)
        return result
    }
}