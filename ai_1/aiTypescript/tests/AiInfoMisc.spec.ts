import { AiMoveState, TAiAbilities, TAiField, TAiPlayerInfo } from '../src/AiInfoDef'
import { playerInfo, playerPosition, bombInfo, bombsOfPlayer, fieldValue, teamplayer, hasAbilities, fieldThreats } from '../src/AiInfo'
import GameStateGenerator from '../src/SearchBeam/GameStateGenerator'
import {centerOnField} from '../src/AiInfoMisc'


import sinon from 'sinon'

describe('AIInfoMisc', () => {
  let playerInfo: TAiPlayerInfo
  describe('centerOnField', () => {
    beforeEach(() => {
       playerInfo = GameStateGenerator.newTAiPlayerInfo()
    });

    it('should center on field', () => {
      playerInfo.Position = {x: 0.5, y: 0.5}
      const result = centerOnField(playerInfo)

      expect(result).toBe(AiMoveState.amNone)
    });

    it('should center on field to right', () => {
      playerInfo.Position = {x: 0.3, y: 0.5}
      const result = centerOnField(playerInfo)

      expect(result).toBe(AiMoveState.amRight)
    });

    it('should center on field to left', () => {
      playerInfo.Position = {x: 0.7, y: 0.5}
      const result = centerOnField(playerInfo)

      expect(result).toBe(AiMoveState.amLeft)
    });

    it('should center on field to up', () => {
      playerInfo.Position = {x: 0.5, y: 0.7}
      const result = centerOnField(playerInfo)

      expect(result).toBe(AiMoveState.amUp)
    });

    it('should center on field to down', () => {
      playerInfo.Position = {x: 0.5, y: 0.3}
      const result = centerOnField(playerInfo)

      expect(result).toBe(AiMoveState.amDown)
    });

    it('epsilon is 0.3. Test right direction', () => {
      playerInfo.Position = {x: 0.7, y: 0.5}
      const result = centerOnField(playerInfo, 0.3)

      expect(result).toBe(AiMoveState.amNone)

      playerInfo.Position = {x: 0.199999, y: 0.5}
      const result1 = centerOnField(playerInfo, 0.3)

      expect(result1).toBe(AiMoveState.amRight)
    });
  });
});
