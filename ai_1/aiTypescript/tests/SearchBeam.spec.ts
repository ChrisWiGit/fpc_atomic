import { AiMoveState, TAiAbilities, TAiField } from '../src/AiInfoDef'
import { playerInfo, playerPosition, bombInfo, bombsOfPlayer, fieldValue, teamplayer, hasAbilities, fieldThreats } from '../src/AiInfo'
import GameState from '../src/SearchBeam/GameState'
import GameStateGenerator from '../src/SearchBeam/GameStateGenerator'
import SearchBeam, { Evaluator } from '../src/SearchBeam/SearchBeamBase'
import sinon from 'sinon'

describe('SearchBeam', () => {
  let searchBeam: SearchBeam
  let gameState: GameState

  beforeEach(() => {
    gameState = GameStateGenerator.newGameState()
  })

  it('constructor', () => { 
    searchBeam = new SearchBeam({} as Evaluator,gameState, 7)

    expect(searchBeam).toBeDefined()
    expect(searchBeam.gameState).toBe(gameState)
    expect(searchBeam.depth).toBe(7)
  });

  describe('generateMoves', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
      searchBeam = new SearchBeam({} as Evaluator, gameState, 7)
    })
    it('all valid moves', () => {
      sinon.stub(gameState, 'isValidMove').returns(true)
      const moves = searchBeam.getAllPossibleMoveDirections(gameState)

      expect(moves).toBeDefined()
      expect(moves.length).toBe(5)

      expect(moves).toEqual([AiMoveState.amNone, AiMoveState.amUp, AiMoveState.amRight, AiMoveState.amDown, AiMoveState.amLeft])
    }); 

    it('with invalid moves', () => {
      sinon.stub(gameState, 'isValidMove').onFirstCall().returns(false).returns(true)

      const moves = searchBeam.getAllPossibleMoveDirections(gameState)

      expect(moves).toBeDefined()
      expect(moves.length).toBe(4)

      expect(moves).toEqual([AiMoveState.amUp, AiMoveState.amRight, AiMoveState.amDown, AiMoveState.amLeft])
    });
  });
});