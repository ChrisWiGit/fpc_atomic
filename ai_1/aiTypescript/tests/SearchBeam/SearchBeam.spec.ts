import SearchBeam, { Evaluator } from "src/SearchBeam/SearchBeamBase";
import GameState from "src/SearchBeam/GameState";
import GameStateGenerator from 'src/SearchBeam/GameStateGenerator'
import { AiMoveState } from 'src/AiInfoDef'
import Sinon from "sinon";
import { DEAD_VALUE } from "src/AiInfo";



describe('AiInfo', () => {
  let gameState: GameState

  beforeEach(() => {
    gameState = GameStateGenerator.newGameState()
  })

  it('getAllPossibleMoveDirections', () => {
    const mockedGameState = {
      isValidMove: Sinon.stub()
    }

    const searchBeam = new SearchBeam({} as Evaluator, {} as GameState, 0)


    mockedGameState.isValidMove = Sinon.stub().returns(true)
    let actual = searchBeam.getAllPossibleMoveDirections(mockedGameState as unknown as GameState)

    expect(actual.length).toBe(5)
    expect(actual).toEqual(
      [AiMoveState.amNone, AiMoveState.amUp, AiMoveState.amRight, AiMoveState.amDown, AiMoveState.amLeft]);

    mockedGameState.isValidMove = Sinon.stub();
    mockedGameState.isValidMove.onCall(0).returns(false);
    mockedGameState.isValidMove.returns(true);
    actual = searchBeam.getAllPossibleMoveDirections(mockedGameState as unknown as GameState)
    expect(actual.length).toBe(4)
    expect(actual).toEqual([AiMoveState.amUp, AiMoveState.amRight, AiMoveState.amDown, AiMoveState.amLeft]);

  })

  it('evaluateMove happy Path', () => {
    const mockedGameState = {
      playerPosition: Sinon.stub().returns(111)
    }
    const mockedEvaluator = {
      evaluateMove: Sinon.stub().returns(1234)
    }

    const actual = new SearchBeam(mockedEvaluator as Evaluator, {} as GameState, 0)
    expect(actual.evaluateMove(mockedGameState as unknown as GameState, AiMoveState.amNone)).toBe(1234)

    expect(mockedGameState.playerPosition.calledOnce).toBe(true)
    expect(mockedEvaluator.evaluateMove.calledOnce).toBe(true)
  })
  it('evaluateMove error', () => {
    const mockedGameState = {
      playerPosition: Sinon.stub().returns(111)
    }
    const mockedEvaluator = {
      evaluateMove: Sinon.stub().returns(1234)
    }

    const actual = new SearchBeam(mockedEvaluator as Evaluator, {} as GameState, 0)
    expect(actual.evaluateMove(null, AiMoveState.amNone)).toBe(DEAD_VALUE)
  })

  it('simulateMove', () => {
    const mockedGameState = {
      move: Sinon.stub().returns(1234)
    }

    const actual = new SearchBeam({} as Evaluator, {} as GameState, 0)
    expect(actual.simulateMove(mockedGameState as unknown as GameState, AiMoveState.amNone)).toBe(1234)
    expect(mockedGameState.move.calledOnce).toBe(true)
  });

});