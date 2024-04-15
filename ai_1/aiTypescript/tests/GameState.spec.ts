import { AiAction, AiMoveState, TAiCommand, TAiField, TAiInfo, TAiVector2, fieldHeight, fieldWidth } from "../src/AiInfoDef"
import GameState from "../src/SearchBeam/GameState"
import vector from "../src/Environment/vector";
import GameStateGenerator from "../src/SearchBeam/GameStateGenerator"
import { bombInfo, fieldValue, playerInfo } from "../src/AiInfo";

/*
const FieldDepth8String =
    "88888888888888888-"+ 
    "87777777777777778-"+
    "87666666666666678-"+
    "87655555555555678-"+
    "87654444444445678-"+
    "87654333333345678-"+
    "87654322222345678-"+
    "87654321112345678-"+
    "87654321012345678-"+
    "87654321112345678-"+
    "87654322222345678-"+
    "87654333333345678-"+
    "87654444444445678-"+
    "87655555555555678-"+
    "87666666666666678-"+
    "87777777777777778-"+
    "88888888888888888";
*/

describe('GameState', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = GameStateGenerator.newGameState()
  });

  it('constructor', () => {
    const gameState1 = GameState.newGamestateFromAiInfoRef(gameState.aiInfo, 0)
    expect(gameState1).toBeDefined();
    expect(gameState1.aiInfo).toBeDefined();
    expect(gameState1.aiInfo).toEqual(gameState.aiInfo);
    expect(gameState1.currentPlayer).toBe(0);
  });
  it('copy constructor', () => {
    const gameStateOrig = GameState.newGamestateFromAiInfoRef(gameState.aiInfo, 1)

    expect(gameStateOrig.aiInfo).toBe(gameState.aiInfo);
    expect(gameStateOrig.currentPlayer).toBe(1);

    const start = process.hrtime();

    const gameState1 = GameState.newGameStateFromGameState(gameStateOrig);
    const end = process.hrtime(start);

    expect(gameState1).toBeDefined();
    expect(gameState1.aiInfo).toBeDefined();
    // ref aiInfo ori und state1 sind unterschiedliche referenzen
    expect(gameState1.aiInfo).not.toBe(gameStateOrig.aiInfo);

    console.debug(`copy constructor: ${end[1] / 1000000}ms`);
    // Berechnet wie of der copy constructor in 1ms aufgerufen werden kann
    console.debug(`copy constructor: ${1000 / (end[1] / 1000000)} times in 1ms`);
    // in 10ms
    console.debug(`copy constructor: ${10000 / (end[1] / 1000000)} times in 10ms`);

    expect(gameState1).toBeDefined();
    gameState1.currentPlayer = 1;

    const newGameState3 = GameState.newGameStateFromGameState(gameState1);
    expect(newGameState3).toBeDefined();
    expect(newGameState3.currentPlayer).toBe(1);
    expect(newGameState3.aiInfo).toEqual(gameState1.aiInfo);
    newGameState3.aiInfo.PlayerInfos[0].Position = { x: 1, y: 1 };
    expect(newGameState3.aiInfo).not.toEqual(gameState1.aiInfo);

    const newGameState4 = GameState.newGameStateFromGameState(newGameState3);
    expect(newGameState4).toBeDefined();
    expect(newGameState4.currentPlayer).toBe(1);
    expect(newGameState4.aiInfo).toEqual(newGameState3.aiInfo);
    expect(newGameState4.aiInfo).not.toEqual(gameState1.aiInfo);
  });
  it('check moveVector', () => {
    const gameState1 = GameState.newGameStateFromGameState(gameState);
    expect(gameState1.moveVector).toBeDefined();
    expect(gameState1.moveVector[AiMoveState.amLeft]).toBe(vector.stepLeft);
    expect(gameState1.moveVector[AiMoveState.amRight]).toBe(vector.stepRight);
    expect(gameState1.moveVector[AiMoveState.amUp]).toBe(vector.stepUp);
    expect(gameState1.moveVector[AiMoveState.amDown]).toBe(vector.stepDown);
    expect(gameState1.moveVector[AiMoveState.amNone]).toBe(vector.identity);
  });

  describe('move', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
      gameState.aiInfo.PlayerInfos[0].Position = { x: 2, y: 2 };
    });


    it('move left', () => {
      const newGameState = gameState.move(AiMoveState.amLeft);
      expect(newGameState).not.toBe(gameState);
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.PlayerInfos[0].Position).toEqual({ x: 1, y: 2 });
    });
    it('move right', () => {
      const newGameState = gameState.move(AiMoveState.amRight);
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.PlayerInfos[0].Position).toEqual({ x: 3, y: 2 });
    });
    it('move up', () => {
      const newGameState = gameState.move(AiMoveState.amUp);
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.PlayerInfos[0].Position).toEqual({ x: 2, y: 1 });
    });
    it('move down', () => {
      const newGameState = gameState.move(AiMoveState.amDown);
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.PlayerInfos[0].Position).toEqual({ x: 2, y: 3 });
    });
    it('move none', () => {
      const newGameState = gameState.move(AiMoveState.amNone);
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.PlayerInfos[0].Position).toEqual({ x: 2, y: 2 });
    });
  });
  describe('isValidMove', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
      expect(gameState.currentPlayer).toBe(0);
      gameState.aiInfo.PlayerInfos[gameState.currentPlayer].Position = { x: 0, y: 0 };
    });
    it('move left', () => {
      expect(gameState.isValidMove(AiMoveState.amLeft)).toBe(false);
      const newGameState = gameState.move(AiMoveState.amRight);
      expect(newGameState.isValidMove(AiMoveState.amLeft)).toBe(true);
    });
    it('move right', () => {
      expect(gameState.isValidMove(AiMoveState.amRight)).toBe(true);

      let lastGameState = gameState;
      for (let i = 0; i < fieldWidth; i++) {
        lastGameState = lastGameState.move(AiMoveState.amRight);
      }
      expect(lastGameState.isValidMove(AiMoveState.amRight)).toBe(false);
    });
    it('move up', () => {
      expect(gameState.isValidMove(AiMoveState.amUp)).toBe(false);
      const newGameState = gameState.move(AiMoveState.amDown);
      expect(newGameState.isValidMove(AiMoveState.amUp)).toBe(true);
    });
    it('move down', () => {
      expect(gameState.isValidMove(AiMoveState.amDown)).toBe(true);

      let lastGameState = gameState;
      for (let i = 0; i < fieldWidth; i++) {
        lastGameState = lastGameState.move(AiMoveState.amDown);
      }
      expect(lastGameState.isValidMove(AiMoveState.amDown)).toBe(false);
    });
    it('move none', () => {
      expect(gameState.isValidMove(AiMoveState.amNone)).toBe(true);
      const newGameState = gameState.move(AiMoveState.amNone);
      expect(newGameState.isValidMove(AiMoveState.amNone)).toBe(true);
    });
  });

  describe('isValidMove Solid oder Brick', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
    });

    it('move left', () => {
      expect(gameState.isValidMove(AiMoveState.amLeft)).toBe(false);

      gameState.aiInfo.Field[0][0] = TAiField.fSolid;
      expect(gameState.isValidMove(AiMoveState.amLeft)).toBe(false);

      gameState.aiInfo.Field[0][0] = TAiField.fBrick;
      expect(gameState.isValidMove(AiMoveState.amLeft)).toBe(false);
    });
    it('move right', () => {
      expect(gameState.isValidMove(AiMoveState.amRight)).toBe(true);

      gameState.aiInfo.Field[1][0] = TAiField.fSolid;
      expect(gameState.isValidMove(AiMoveState.amRight)).toBe(false);

      gameState.aiInfo.Field[fieldWidth - 1][0] = TAiField.fBrick;
      expect(gameState.isValidMove(AiMoveState.amRight)).toBe(false);
    });
    it('move up', () => {
      gameState.aiInfo.Field[0][0] = TAiField.fSolid;
      expect(gameState.isValidMove(AiMoveState.amUp)).toBe(false);
      gameState.aiInfo.Field[0][0] = TAiField.fBrick;
      expect(gameState.isValidMove(AiMoveState.amUp)).toBe(false);
    });
    it('move down', () => {
      expect(gameState.isValidMove(AiMoveState.amDown)).toBe(true);

      gameState.aiInfo.Field[0][1] = TAiField.fSolid;
      expect(gameState.isValidMove(AiMoveState.amDown)).toBe(false);

      gameState.aiInfo.Field[0][1] = TAiField.fBrick;
      expect(gameState.isValidMove(AiMoveState.amDown)).toBe(false);
    });
  });

  it('isPlayerAlive', () => {
    const isPlayerAlive = gameState.isPlayerAlive();
    expect(isPlayerAlive).toBe(false);

    gameState.aiInfo.PlayerInfos[0].Alive = true;
    const isPlayerAlive1 = gameState.isPlayerAlive();
    expect(isPlayerAlive1).toBe(true);
  });

  it('isPlayerFlying', () => {
    const isPlayerFlying = gameState.isPlayerFlying();
    expect(isPlayerFlying).toBe(false);

    gameState.aiInfo.PlayerInfos[0].Flying = true;
    const isPlayerFlying1 = gameState.isPlayerFlying();
    expect(isPlayerFlying1).toBe(true);
  });

  it('playerPosition', () => {
    const playerPosition = gameState.playerPosition();
    expect(playerPosition).toBeDefined();
    expect(playerPosition).toEqual({ x: 0, y: 0 });

    gameState.aiInfo.PlayerInfos[0].Position = { x: 1, y: 1 };
    const playerPosition1 = gameState.playerPosition();
    expect(playerPosition1).toBeDefined();

    gameState.aiInfo.PlayerInfos[1].Position = { x: 1, y: 1 };
    const playerPosition2 = gameState.playerPosition(1);
    expect(playerPosition2).toBeDefined();
    expect(playerPosition2).toEqual({ x: 1, y: 1 });
  });

  describe('bomb', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
    });

    it('isImmediateLifeThreatening', () => {
      const isImmediateLifeThreatening = gameState.isImmediateLifeThreatening({ x: 0, y: 0 });
      expect(isImmediateLifeThreatening).toBe(false);

      gameState.aiInfo.Field[0][0] = TAiField.fFlame;
      const isImmediateLifeThreatening1 = gameState.isImmediateLifeThreatening({ x: 0, y: 0 });
      expect(isImmediateLifeThreatening1).toBe(true);
    });

    it('canPlantBomb', () => {
      playerInfo(gameState.aiInfo, 0).AvailableBombs = 1;
      gameState.aiInfo.BombsCount = 0;

      const canPlantBomb = gameState.canPlantBomb();
      expect(canPlantBomb).toBe(true);

      gameState.aiInfo.PlayerInfos[0].AvailableBombs = 0;
      const canPlantBomb1 = gameState.canPlantBomb();
      expect(canPlantBomb1).toBe(false);

      gameState.aiInfo.Bombs.push(GameStateGenerator.newTAiBombInfo());
      const canPlantBomb2 = gameState.canPlantBomb();
      expect(canPlantBomb2).toBe(false);
    });

    it('plantBomb', () => {
      const newGameState = gameState.plantBomb();
      expect(newGameState).toBeDefined();
      expect(newGameState.aiInfo.Bombs.length).toBe(1);
      expect(newGameState.aiInfo.BombsCount).toBe(1);
      expect(newGameState.aiInfo.Bombs[0].Position).toEqual({ x: 0, y: 0 });
      expect(newGameState.aiInfo.Bombs[0].Owner).toBe(0);
      expect(newGameState.aiInfo.Bombs[0].FlameLength).toBe(3);
      expect(newGameState.aiInfo.Bombs[0].ManualTrigger).toBe(false);
      expect(newGameState.aiInfo.Bombs[0].Jelly).toBe(false);
    });
  });

  describe('clone', () => {
    beforeEach(() => {
      gameState = GameStateGenerator.newGameState()
    });

    it('clone', () => {
      const newGameState = gameState.clone();
      expect(newGameState).toBeDefined();
      expect(newGameState).not.toBe(gameState);
      expect(newGameState.aiInfo).toEqual(gameState.aiInfo);
      expect(newGameState.aiInfo).not.toBe(gameState.aiInfo);
      expect(newGameState.currentPlayer).toBe(gameState.currentPlayer);
      expect(newGameState.moveVector).toEqual(gameState.moveVector);
      expect(newGameState.moveVector).not.toBe(gameState.moveVector);
    });

    it('assignFrom', () => {
      const newGameState = GameStateGenerator.newGameState()
      newGameState.aiInfo.PlayerInfos[0].Position = { x: 1, y: 1 };
      newGameState.currentPlayer = 1;

      gameState.assignFrom(newGameState);
      expect(gameState.aiInfo).toEqual(newGameState.aiInfo);
      expect(gameState.aiInfo).not.toBe(newGameState.aiInfo);
      expect(gameState.currentPlayer).toBe(newGameState.currentPlayer);
    });
  });
});