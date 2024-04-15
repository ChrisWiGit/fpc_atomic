import { AiMoveState, TAiAbilities, TAiField } from '../src/AiInfoDef'
import { playerInfo, playerPosition, bombInfo, bombsOfPlayer, fieldValue, teamplayer, hasAbilities, fieldThreats } from '../src/AiInfo'
import GameState from '../src/SearchBeam/GameState'
import GameStateGenerator from '../src/SearchBeam/GameStateGenerator'
import SearchBeam from '../src/SearchBeam/SearchBeamBase'
import AiMemoryService, {IAiMemory, AiMemory }  from '../src/AIs/AiMemory'
import sinon from 'sinon'

describe('AiMemory', () => {
  let aiMemory: AiMemory


  it('constructor', () => { 
    aiMemory = new AiMemory(42)
    expect(aiMemory).toBeDefined()
    expect(aiMemory.getMemory(0)).toEqual([])
    expect(aiMemory.getMaxMemory()).toEqual(42)
  })

  describe('putMemory', () => {
    beforeEach(() => {
      aiMemory = new AiMemory(100)
    })

    it('should put memory', () => {
      const gameState = GameStateGenerator.newGameState()
      const diffs : any[] = []
      
      aiMemory.putMemory(0, gameState, diffs)
      expect(aiMemory.getMemory(0)).toEqual([{
        time: expect.any(Number),
        gameState: gameState,
        diffs: diffs
      }])

      expect(aiMemory.getMemory(1)).toEqual([])
    })
  })

  describe('getMemory', () => {
    beforeEach(() => {
      aiMemory = new AiMemory(100)
    })

    it('should get memory', () => {
      expect(aiMemory.getMemory(0)).toEqual([])
    });

    it('should get memory', () => {
      const gameState = GameStateGenerator.newGameState()
      const diffs : any[] = []
      
      aiMemory.putMemory(0, gameState, diffs)
      expect(aiMemory.getMemory(0)).toEqual([{
        time: expect.any(Number),
        gameState: gameState,
        diffs: diffs
      }])

      expect(aiMemory.getMemory(1)).toEqual([])
    })
  })

})