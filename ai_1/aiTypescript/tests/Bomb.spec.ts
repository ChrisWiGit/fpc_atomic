import { AiMoveState, TAiAbilities, TAiBombInfo, TAiField } from '../src/AiInfoDef'
import { getBombBlastRadius } from '../src/Environment/bomb'
import {
  playerInfo, playerPosition, bombInfo, bombsOfPlayer, fieldValue,
  teamplayer, hasAbilities, fieldThreats, moveDirections, bombAt, isPowerUpAt, isWalkable, playerAt
} from '../src/AiInfo'
import GameState from '../src/SearchBeam/GameState'
import GameStateGenerator from '../src/SearchBeam/GameStateGenerator'

describe('Bomb', () => {
  let gameState: GameState
  let bombInfo: TAiBombInfo

  beforeEach(() => {
    gameState = GameStateGenerator.newGameState()
    bombInfo = GameStateGenerator.newTAiBombInfo({ Position: { x: 2, y: 1 }, FlameLength: 3 })
    gameState.aiInfo.Bombs = [bombInfo]
    gameState.aiInfo.BombsCount = gameState.aiInfo.Bombs.length

    gameState.aiInfo.Field[2][2] = TAiField.fSolid
    gameState.aiInfo.Field[3][1] = TAiField.fPunch
  })

  it('getBombBlastRadius', () => {
    const radius1 = getBombBlastRadius(bombInfo, gameState.aiInfo, { stopAtNotBlankFields: false, includeEatenPowerUp: false })
    expect(radius1).toBeDefined()
    expect(radius1.length).toBe(4)
    expect(radius1[0].length).toBe(1) // 1 nach oben frei, dann Bande
    expect(radius1[1].length).toBe(3) // alles frei 
    expect(radius1[2].length).toBe(2) // 2 nach links frei, dann Bande
    expect(radius1[3].length).toBe(3) // punch rechts ignoriert
  });

  it('getBombBlastRadius, stopAtNotBlankFields: true', () => {
    const radius1 = getBombBlastRadius(bombInfo, gameState.aiInfo, { stopAtNotBlankFields: true, includeEatenPowerUp: false })
    expect(radius1).toBeDefined()
    expect(radius1.length).toBe(4)
    expect(radius1[0].length).toBe(1)
    expect(radius1[1].length).toBe(0) // fSolid direkt links
    expect(radius1[2].length).toBe(2)
    expect(radius1[3].length).toBe(0) 
  });

  it('getBombBlastRadius, stopAtNotBlankFields: true, includeEatenPowerUp: true', () => {
    const radius1 = getBombBlastRadius(bombInfo, gameState.aiInfo, { stopAtNotBlankFields: true, includeEatenPowerUp: true })
    expect(radius1).toBeDefined()
    expect(radius1.length).toBe(4)
    expect(radius1[0].length).toBe(1)
    expect(radius1[1].length).toBe(0) // fSolid direkt links
    expect(radius1[2].length).toBe(2)
    expect(radius1[3].length).toBe(1) // fPunch direkt rechts ist inklusive
  });

});
