import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiBombInfo, TAiPlayerInfo, TMessageType, 
  PlayerInfosArray, FieldType,
  fieldHeight, fieldWidth, maxPlayerCount } from "../src/AiInfoDef"
import GameStateGenerator from "../src/SearchBeam/GameStateGenerator"


describe('GameStateGenerator', () => {
  it('newTAiPlayerInfo', () => {
    const playerInfo = GameStateGenerator.newTAiPlayerInfo();
    expect(playerInfo).toBeDefined();
    expect(playerInfo.Team).toBe(0);
    expect(playerInfo.Position).toEqual({ x: 0, y: 0 });
    expect(playerInfo.Alive).toBe(false);
    expect(playerInfo.Flying).toBe(false);
    expect(playerInfo.FlameLength).toBe(3);
    expect(playerInfo.AvailableBombs).toBe(1);
    expect(playerInfo.Speed).toBe(1);
    expect(playerInfo.Abilities).toBe(0);
  });

  it('newField', () => {
    const field = GameStateGenerator.newField();
    expect(field).toBeDefined();
    expect(field.length).toBe(fieldWidth);
    expect(field[0].length).toBe(fieldHeight);
    expect(field[0][0]).toBe(TAiField.fBlank);
  });

  it('newTAiBombInfo', () => {
    const bombInfo = GameStateGenerator.newTAiBombInfo();
    expect(bombInfo).toBeDefined();
    expect(bombInfo.Position).toEqual({ x: 0, y: 0 });
    expect(bombInfo.FlameLength).toBe(3);
    expect(bombInfo.Flying).toBe(false);
    expect(bombInfo.Owner).toBe(0);
    expect(bombInfo.ManualTrigger).toBe(false);
    expect(bombInfo.Jelly).toBe(false);
    expect(bombInfo.DudBomb).toBe(false);
  });

  it('newTAiInfo', () => {
    const aiInfo = GameStateGenerator.newTAiInfo();
    expect(aiInfo).toBeDefined();
    expect(aiInfo.type).toBe(TMessageType.Update);
    expect(aiInfo.player).toBe(0);
    expect(aiInfo.Teamplay).toBe(false);
    expect(aiInfo.Field).toBeDefined();
    expect(aiInfo.Field.length).toBe(fieldWidth);
    expect(aiInfo.Field[0].length).toBe(fieldHeight);
    expect(aiInfo.PlayerInfos).toBeDefined();
    expect(aiInfo.PlayerInfos.length).toBe(maxPlayerCount);
    expect(aiInfo.Bombs).toBeDefined();
    expect(aiInfo.Bombs.length).toBe(10);
    expect(aiInfo.BombsCount).toBe(0);
  });

  it('newTAiInfo PlayerInfos not referenced', () => {
    const aiInfo = GameStateGenerator.newTAiInfo();
    expect(aiInfo).toBeDefined();
    expect(aiInfo.PlayerInfos).toBeDefined();
    expect(aiInfo.PlayerInfos.length).toBe(maxPlayerCount);
    expect(aiInfo.PlayerInfos[0]).not.toBe(aiInfo.PlayerInfos[1]);
  });

  it('newGameState', () => {
    const gameState = GameStateGenerator.newGameState();
    expect(gameState).toBeDefined();
    expect(gameState.aiInfo).toBeDefined();
    expect(gameState.aiInfo.type).toBe(TMessageType.Update);
    expect(gameState.aiInfo.player).toBe(0);
    expect(gameState.aiInfo.Teamplay).toBe(false);
    expect(gameState.aiInfo.Field).toBeDefined();
    expect(gameState.aiInfo.Field.length).toBe(fieldWidth);
    expect(gameState.aiInfo.Field[0].length).toBe(fieldHeight);
    expect(gameState.aiInfo.PlayerInfos).toBeDefined();
    expect(gameState.aiInfo.PlayerInfos.length).toBe(maxPlayerCount);
    expect(gameState.aiInfo.Bombs).toBeDefined();
    // Bombem werden in GameState auf 0 gesetzt
    expect(gameState.aiInfo.Bombs.length).toBe(0);
    expect(gameState.aiInfo.BombsCount).toBe(0);
  });
   
});