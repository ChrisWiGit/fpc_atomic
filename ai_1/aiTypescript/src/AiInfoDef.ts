export enum TMessageType {
    // message tells that a new round is starting. Use TAiNewRound.
    NewRound = "newround",
    // message tells that the game state has changed. Use TAiInfo.
    Update = "info"
}

export enum MessageDataType {
    mdtString = 1,
    mdtCommand = 2
}

export interface TAiNewRound {
    type: TMessageType;
    Strength: number;
}


export interface TAiVector2 {
    x: number;
    y: number;
}



export enum TAiAbilities {
    Ability_CanKick = 1,
    Ability_CanSpoog = 2,
    Ability_CanPunch = 4,
    Ability_CanGrab = 8,
    Ability_CanTrigger = 16,
    Ability_CanJelly = 32,
}

export enum TAiField {
    fBlank = 0,
    fBrick = 1,
    fSolid = 2,
    fHole = 3, // A beamimg hole they beam counter clock wise
    fTramp = 4, // A tramp that kicks the player in the air
    fConveyorUp = 5, // If the player stands on this field it is being pushed in the "up" direction
    fConveyorDown = 6, // If the player stands on this field it is being pushed in the "up" direction
    fConveyorLeft = 7, // If the player stands on this field it is being pushed in the "up" direction
    fConveyorRight = 8, // If the player stands on this field it is being pushed in the "up" direction
    fArrowUp = 9, // If a bomb is beeing kicked against this field its direction will change to "up"
    fArrowDown = 10, // If a bomb is beeing kicked against this field its direction will change to "down"
    fArrowLeft = 11, // If a bomb is beeing kicked against this field its direction will change to "left"
    fArrowRight = 12, // If a bomb is beeing kicked against this field its direction will change to "right"
    fFlame = 13,
    fExtraBomb = 14,
    fLongerFlame = 15,
    fGoldflame = 16,
    fExtraSpeed = 17,
    fKick = 18,
    fSpooger = 19,
    fPunch = 20,
    fGrab = 21,
    fTrigger = 22,
    fJelly = 23,
    fRandom = 24,
    fSlow = 25,
    fDisease = 26,
    fBadDisease = 27    
}

export interface TAiPlayerInfo {
    Team: number;
    Position: TAiVector2;
    // If true the player is still alive. If false the player is dead and must be ignored.
    Alive: boolean;
    // If true the player is flying and may be outside of the play field boundaries. In this case Position may be outside the play field boundaries.
    Flying: boolean;
    // The current maximum length of a bomb that the player can place.
    FlameLength: number;
    // Number of bombs that the player can still place.
    AvailableBombs: number;
    // The actual speed of the player in fields per second. This is usually a number with comma, e.g. 1.5.
    Speed: number;
    // The abilities of the player. This is a bit field. Use the TAiAbilities enum to check for abilities.
    Abilities: number;
}

export interface TAiBombInfo {
    // Position of the bomb. If Flying is true, this may be outside the play field boundaries.
    Position: TAiVector2;
    // Length of fields in all directions that bomb will kill player.
    FlameLength: number;
    // If true the bomb is currently not on the field, and its Position may not be within the play field boundaries.
    Flying: boolean;
    // play index of the player that owns this bomb. 
    Owner: number;
    // This bomb must be triggered manually. If false, it will be triggered automatically.
    ManualTrigger: boolean;
    // If true, the bomb may bounce off walls.
    Jelly: boolean;
    // If true, the dud bomb animation is showing (means the bomb will not explode for an unknown amount of time). 
    DudBomb: boolean;
}

export interface TAiInfo {
    // only used for differentiating between newround and update. Not used for AI!
    type: TMessageType;
    // player is used for type == NewRound only and contains the player index that is the current player that received this TAiInfo object.
    player: number;
    // whether the game is teamplay or not. If true, TAiPlayerInfo.Team is used to determine the team of the player.
    Teamplay: boolean;
    // All players in the game. The index of the player is the index in the array.
    
    PlayerInfos: PlayerInfosArray;
    // The layout of the play field.
    Field: FieldType;
    // Count of bombs in the game
    BombsCount: number;
    // All bombs in the game. Array size is BombsCount.
    Bombs: Array<TAiBombInfo>;
}


export enum AiAction {
    apNone, // AI does not want to execute any action
    apFirst, // AI wants to perform a "primary" action, e.g. place a bomb...
    apFirstDouble, // AI wants to perform a "primary" double action, e.g. spooge, grab... (when doing First Double, a First action is automatically done before)
    apSecond, // AI wants to perform a "secondary" action, e.g. punch...
    apSecondDouble // Unused till now       
}

export enum AiMoveState {
    amNone, // AI wants to stand still = no walking
    amLeft, // AI wants to move to the left
    amRight, // AI wants to move to the right
    amUp, // AI wants to move up
    amDown // AI wants to move down    
}

export interface TAiCommand {
    Action: AiAction;
    MoveState: AiMoveState;
}


export const fieldWidth: number = 15;
export const fieldHeight: number = 11;
export const fieldLastX: number = fieldWidth - 1;
export const fieldLastY: number = fieldHeight - 1;
export const maxPlayerCount: number = 8;


export type PlayerInfosArray = [TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo, TAiPlayerInfo];
export type FieldType = [[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField],
[TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField, TAiField]
]