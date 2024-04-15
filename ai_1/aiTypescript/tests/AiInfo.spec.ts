import { AiMoveState, TAiAbilities, TAiField } from '../src/AiInfoDef'
import {
  playerInfo, playerPosition, bombInfo, bombsOfPlayer, fieldValue,
  teamplayer, hasAbilities, fieldThreats, moveDirections, bombAt, isPowerUpAt, isWalkable, playerAt, DEAD_VALUE
} from '../src/AiInfo'
import GameState from '../src/SearchBeam/GameState'
import GameStateGenerator from '../src/SearchBeam/GameStateGenerator'

describe('AiInfo', () => {
  let gameState: GameState

  beforeEach(() => {
    gameState = GameStateGenerator.newGameState()
  })

  it('playerInfo', () => {
    const playerInfo1 = playerInfo(gameState.aiInfo, 0)

    expect(playerInfo1).toBeDefined()
    expect(playerInfo1).toBe(gameState.aiInfo.PlayerInfos[0])

    const playerInfo2 = playerInfo(gameState.aiInfo, 2)

    expect(playerInfo2).toBeDefined()
    expect(playerInfo2).toBe(gameState.aiInfo.PlayerInfos[2])

    const playerInfoNone = playerInfo(gameState.aiInfo, 9)

    expect(playerInfoNone).toBeUndefined()
  })

  it('playerPosition', () => {
    const playerPosition1 = playerPosition(gameState.aiInfo, 0)

    expect(playerPosition1).toBeDefined()
    expect(playerPosition1).toBe(gameState.aiInfo.PlayerInfos[0].Position)

    const playerPosition2 = playerPosition(gameState.aiInfo, 2)

    expect(playerPosition2).toBeDefined()
    expect(playerPosition2).toBe(gameState.aiInfo.PlayerInfos[2].Position)

    const playerPositionNone = playerPosition(gameState.aiInfo, 9)

    expect(playerPositionNone).toBeUndefined()
  })

  it('bombInfo', () => {

    gameState.aiInfo.Bombs = [GameStateGenerator.newTAiBombInfo(), GameStateGenerator.newTAiBombInfo()]
    gameState.aiInfo.BombsCount = 2

    const bombInfo1 = bombInfo(gameState.aiInfo, 0)

    expect(bombInfo1).toBeDefined()
    expect(bombInfo1).toBe(gameState.aiInfo.Bombs[0])

    const bombInfo2 = bombInfo(gameState.aiInfo, 1)

    expect(bombInfo2).toBeDefined()
    expect(bombInfo2).toBe(gameState.aiInfo.Bombs[1])

    const bombInfoNone = bombInfo(gameState.aiInfo, 9)

    expect(bombInfoNone).toBeNull()
  })

  it('bombsOfPlayer', () => {
    gameState.aiInfo.Bombs = [GameStateGenerator.newTAiBombInfo(), GameStateGenerator.newTAiBombInfo()]
    gameState.aiInfo.Bombs[0].Owner = 0
    gameState.aiInfo.Bombs[1].Owner = 1
    gameState.aiInfo.BombsCount = 2

    const bombsOfPlayer1 = bombsOfPlayer(gameState.aiInfo, 0)

    expect(bombsOfPlayer1).toBeDefined()
    expect(bombsOfPlayer1).toEqual([gameState.aiInfo.Bombs[0]])

    const bombsOfPlayer2 = bombsOfPlayer(gameState.aiInfo, 1)

    expect(bombsOfPlayer2).toBeDefined()
    expect(bombsOfPlayer2).toEqual([gameState.aiInfo.Bombs[1]])

    const bombsOfPlayerNone = bombsOfPlayer(gameState.aiInfo, 9)

    expect(bombsOfPlayerNone).toEqual([])
  })

  it('fieldValue', () => {
    const fieldValue1 = fieldValue(gameState.aiInfo, 0, 0)

    expect(fieldValue1).toBeDefined()
    expect(fieldValue1).toBe(gameState.aiInfo.Field[0][0])

    const fieldValue2 = fieldValue(gameState.aiInfo, 1, 1)

    expect(fieldValue2).toBeDefined()
    expect(fieldValue2).toBe(gameState.aiInfo.Field[1][1])

    const fieldValueNone = fieldValue(gameState.aiInfo, -1, -1)

    expect(fieldValueNone).toBeUndefined()
  })

  it('teamplayer', () => {
    gameState.aiInfo.Teamplay = true
    gameState.aiInfo.PlayerInfos[0].Team = 0
    gameState.aiInfo.PlayerInfos[1].Team = 0
    gameState.aiInfo.PlayerInfos[2].Team = 1

    const teamplayer1 = teamplayer(gameState.aiInfo, 0, 1)

    expect(teamplayer1).toBe(true)

    const teamplayer2 = teamplayer(gameState.aiInfo, 0, 2)

    expect(teamplayer2).toBe(false)

    const teamplayerNone = teamplayer(gameState.aiInfo, 0, 9)

    expect(teamplayerNone).toBe(false)
  })

  it('hasAbilities', () => {
    gameState.aiInfo.PlayerInfos[0].Abilities = TAiAbilities.Ability_CanGrab | TAiAbilities.Ability_CanJelly
    gameState.aiInfo.PlayerInfos[1].Abilities = TAiAbilities.Ability_CanTrigger
    gameState.aiInfo.PlayerInfos[2].Abilities = TAiAbilities.Ability_CanKick

    const hasAbilities1 = hasAbilities(gameState.aiInfo, 0, TAiAbilities.Ability_CanJelly)

    expect(hasAbilities1).toBe(true)

    const hasAbilities2 = hasAbilities(gameState.aiInfo, 1, TAiAbilities.Ability_CanTrigger)

    expect(hasAbilities2).toBe(true)

    const hasAbilities3 = hasAbilities(gameState.aiInfo, 2, TAiAbilities.Ability_CanKick)

    expect(hasAbilities3).toBe(true)

    const hasAbilitiesNone = hasAbilities(gameState.aiInfo, 0, TAiAbilities.Ability_CanKick)

    expect(hasAbilitiesNone).toBe(false)

    // multiple abilities with | ability
    const hasAbilities4 = hasAbilities(gameState.aiInfo, 0, TAiAbilities.Ability_CanJelly | TAiAbilities.Ability_CanGrab)

    expect(hasAbilities4).toBe(true)

    const hasAbilities5 = hasAbilities(gameState.aiInfo, 0, TAiAbilities.Ability_CanJelly | TAiAbilities.Ability_CanTrigger)

    expect(hasAbilities5).toBe(false)
  })

  it('fieldThreats contains all values of TAiField', () => {
    const allValues = Object.values(TAiField).filter(value => Number.isInteger(value)) as number[]
    const fieldThreatsValues = fieldThreats.map(fieldThreat => fieldThreat.key)

    allValues.forEach(value => {
      expect(fieldThreatsValues).toContain(value)
    })

    expect
  })

  it('moveDirections', () => {
    expect(moveDirections).toBeDefined()
    expect(moveDirections).toEqual([AiMoveState.amNone, AiMoveState.amUp, AiMoveState.amRight, AiMoveState.amDown, AiMoveState.amLeft])
  });

  it('fieldThreats', () => {
    expect(fieldThreats).toBeDefined()
    expect(fieldThreats.length).toBe(28)

    expect(fieldThreats).toContainEqual({ key: TAiField.fBlank, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fBrick, value: DEAD_VALUE })
    expect(fieldThreats).toContainEqual({ key: TAiField.fSolid, value: DEAD_VALUE })
    expect(fieldThreats).toContainEqual({ key: TAiField.fHole, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fTramp, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fConveyorUp, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fConveyorDown, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fConveyorLeft, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fConveyorRight, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fArrowUp, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fArrowDown, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fArrowLeft, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fArrowRight, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fFlame, value: DEAD_VALUE })
    expect(fieldThreats).toContainEqual({ key: TAiField.fExtraBomb, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fLongerFlame, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fGoldflame, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fExtraSpeed, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fKick, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fJelly, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fPunch, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fGrab, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fTrigger, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fSpooger, value: 1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fRandom, value: 0 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fSlow, value: -1 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fDisease, value: -10 })
    expect(fieldThreats).toContainEqual({ key: TAiField.fBadDisease, value: -20 })
  })
  it('bombAt', () => {
    gameState.aiInfo.Bombs = [GameStateGenerator.newTAiBombInfo(), GameStateGenerator.newTAiBombInfo()]
    gameState.aiInfo.Bombs[0].Position = { x: 0, y: 0 }
    gameState.aiInfo.Bombs[1].Position = { x: 1, y: 1 }
    gameState.aiInfo.BombsCount = 2

    const bombAt1 = bombAt(gameState.aiInfo, 0, 0)

    expect(bombAt1).toBeDefined()
    expect(bombAt1).toBe(gameState.aiInfo.Bombs[0])

    const bombAt2 = bombAt(gameState.aiInfo, 1, 1)

    expect(bombAt2).toBeDefined()
    expect(bombAt2).toBe(gameState.aiInfo.Bombs[1])

    const bombAtNone = bombAt(gameState.aiInfo, 9, 9)
    expect(bombAtNone).toBeNull()
  })

  it('isPowerUpAt', () => {

    gameState.aiInfo.Field[0][0] = TAiField.fExtraBomb
    gameState.aiInfo.Field[1][1] = TAiField.fLongerFlame
    gameState.aiInfo.Field[2][2] = TAiField.fDisease;

    const powerUpAt1 = isPowerUpAt(gameState.aiInfo, { x: 0, y: 0 })
    
    expect(powerUpAt1).toBe(true)

    const powerUpAt2 = isPowerUpAt(gameState.aiInfo, { x: 1, y: 1 })
    expect(powerUpAt2).toBe(true)

    const powerUpAtNone = isPowerUpAt(gameState.aiInfo, { x: 9, y: 9 })
    expect(powerUpAtNone).toBe(false)

    gameState.aiInfo.Field[0][0] = TAiField.fExtraBomb;
    gameState.aiInfo.Field[1][1] = TAiField.fLongerFlame;

    const fDisease = isPowerUpAt(gameState.aiInfo, { x: 2, y: 2 }, true);
    expect(fDisease).toBe(false);
  })

  it('isWalkable', () => {
    gameState.aiInfo.Field[0][0] = TAiField.fBlank
    gameState.aiInfo.Field[1][1] = TAiField.fHole
    gameState.aiInfo.Field[2][2] = TAiField.fArrowRight
    gameState.aiInfo.Field[9][9] = TAiField.fSolid
    gameState.aiInfo.Field[10][10] = TAiField.fBrick

    const walkable1 = isWalkable(gameState.aiInfo, { x: 0, y: 0 })
    expect(walkable1).toBe(true)

    const walkable2 = isWalkable(gameState.aiInfo, { x: 1, y: 1 })
    expect(walkable2).toBe(true)

    const walkable3 = isWalkable(gameState.aiInfo, { x: 2, y: 2 })
    expect(walkable3).toBe(true)

    const walkableNone = isWalkable(gameState.aiInfo, { x: 9, y: 9 })
    expect(walkableNone).toBe(false)

    const walkableNone2 = isWalkable(gameState.aiInfo, { x: 10, y: 10 })
    expect(walkableNone2).toBe(false)
  })

  it('playerAt', () => {
    gameState.aiInfo.PlayerInfos[0].Position = { x: 10, y: 10 }

    const playerAt1 = playerAt(gameState.aiInfo, 10, 10)
    expect(playerAt1).toBe(0)

    const playerAt2 = playerAt(gameState.aiInfo, 9, 9)
    expect(playerAt2).toBe(-1)
  });
})
