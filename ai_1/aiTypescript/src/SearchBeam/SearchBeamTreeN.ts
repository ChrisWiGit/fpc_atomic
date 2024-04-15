import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiVector2 } from "../AiInfoDef"
import { playerInfo, playerPosition, hasAbilities, fieldThreats, fieldValue, bombsOfPlayer, AiMoveStateAsString, AiActionAsString, DEAD_VALUE } from "../AiInfo"
import { moveDirections } from "../AiInfo"
import GameState from './GameState'
import SearchBeamBase, { BeamState, Evaluator } from './SearchBeamBase'
import Tree from './Tree'


export default class SearchBeamTreeN extends SearchBeamBase {
    beamTree: Tree<BeamState> | null = null
    linearBeams: BeamState[] = []

    constructor(evaluator: Evaluator, gameState: GameState, depth: number) {
        super(evaluator, gameState, depth)
    }

    initBeams(): void {
        const firstState: BeamState = {
            gameState: this.gameState,
            score: 0,
            move: AiMoveState.amNone,
            action: AiAction.apNone
        }
        this.beamTree = new Tree(firstState)
    }

    startBeams(): void {
        if (!this.beamTree) {
            return
        }
        // 1. erster knoten des baums geht für die 4 möglichen richtungen
        // 2. zweite Ebenen mit den 4 möglichen Richtungen geht weiter für die 4 möglichen Richtungen
        // 3. Danach wird für jede der 16 möglichen Richtungen die nächste Ebene 
        // berechnet, indem je die 4 möglichen Richtungen der beste Score berechnet wird und 
        // in den Baum eingefügt wird. 

        const firstGameState = this.beamTree.value.gameState

        // 1. Ebene maximal 4 Kinder
        this.process1stLevel(firstGameState, this.beamTree)

        // 2. Ebene maximal 16 Kinder
        this.process2ndLevel(this.beamTree)

        // evaluiere die nächsten 4 Richtungen mit getAllPossibleMoveDirections und nehme die beste
        this.linearBeams = this.processLeafsWithLinearMaxDepth(this.beamTree)

        console.log('BeamTree')
        console.dir(this.beamTree)
    }

    private process1stLevel(firstGameState: GameState, { addChild, value }: Tree<BeamState>) {
        this.getAllPossibleMoveDirections(value.gameState).forEach(move => {
            const nextGamestateAfterMoving = this.simulateMove(firstGameState, move) as GameState

            addChild({
                move,
                gameState: nextGamestateAfterMoving,
                score: this.evaluateMove(nextGamestateAfterMoving, move) + value.score,
                action: AiAction.apNone
            })
        })
    }

    private process2ndLevel({ enumerateLeafs }: Tree<BeamState>) {
        enumerateLeafs().forEach(leaf => {
            this.getAllPossibleMoveDirections(leaf.value.gameState).forEach(move => {
                const nextGamestateAfterMoving = this.simulateMove(leaf.value.gameState, move) as GameState

                leaf.addChild({
                    move: move,
                    gameState: nextGamestateAfterMoving,
                    score: this.evaluateMove(nextGamestateAfterMoving, move) + leaf.value.score,
                    action: AiAction.apNone
                })
            })
        })
    }

    // zyklische Komplexität ist 
    private processLeaf({value: leafValue, addChild}: Tree<BeamState>) : BeamState {
        for (let currentDepth = this.depth; currentDepth > 0; currentDepth--) {
            const bestMove = this.evaluateNextBestMove(leafValue);

            if (!bestMove) {
                console.debug('SearchBeamTreeN:startBeams: no best move', leafValue.gameState.playerPosition());
                break; // Exit the loop if no best move is found.
            }

            const nextGameStateAfterMoving = this.simulateMove(leafValue.gameState, bestMove) as GameState;
            const newBeamState: BeamState = {
                move: bestMove,
                gameState: nextGameStateAfterMoving,
                score: this.evaluateMove(nextGameStateAfterMoving, bestMove) + leafValue.score,
                action: AiAction.apNone,
            };
            leafValue = newBeamState; // Assuming we want to update the leaf's value with the new beam state.
        }

        // After finishing the depth processing, add the leaf's final state.
        addChild(leafValue); // Assuming we want to add the final beam state as a child of the leaf.
        return leafValue
    }

    private processLeafsWithLinearMaxDepth({ enumerateLeafs }: Tree<BeamState>) : BeamState[] {
        const result: BeamState[] = []

        enumerateLeafs().forEach(leaf => {
            result.push(this.processLeaf(leaf))
        });

        return result
    }


    private evaluateNextBestMove({ gameState }: BeamState): AiMoveState | null {
        const result = this.getAllPossibleMoveDirections(gameState).reduce((max, current) => {
            // Infinity verhindert, dass null als max zurückgegeben wird
            return this.evaluateMove(gameState, current) || -Infinity > max ? current : max
        }, -Infinity)
        return result === -Infinity ? null : result
    }

    resultBeamsResult(): BeamState | null {
        if (!this.beamTree) {
            return null
        }
        // max value leaf
        // return this.beamTree.enumerateLeafs().reduce((max, current) => {
        //     return current.value.score > max.value.score ? current : max
        // })?.value || null

        const sortedBeams = this.linearBeams.sort((a, b) => b.score - a.score)

        // besten Score
        return sortedBeams[0]
    }
}