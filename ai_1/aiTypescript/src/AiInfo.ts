import { AiAction, AiMoveState, TAiBombInfo, TAiCommand, TAiField, TAiInfo, TAiPlayerInfo, TAiVector2, TAiAbilities }
    from "./AiInfoDef"


export function playerInfo(action: TAiInfo, player: number): TAiPlayerInfo {
    return action.PlayerInfos[player]
}
export function playerPosition(action: TAiInfo, player: number): TAiVector2 {
    return playerInfo(action, player)?.Position
}

export function playerAt(action: TAiInfo, x: number, y: number): number {
    for (let i = 0; i < action.PlayerInfos.length; i++) {
        if (action.PlayerInfos[i].Position.x === x && action.PlayerInfos[i].Position.y === y) {
            return i
        }
    }
    return -1
}

export function bombInfo(action: TAiInfo, bomb: number): TAiBombInfo | null {
    if (bomb >= action.Bombs.length) {
        return null
    }
    return action.Bombs[bomb]
}

export function bombAt(action: TAiInfo, x: number, y: number): TAiBombInfo | null {
    return action.Bombs.find(bomb => bomb.Position.x === x && bomb.Position.y === y) || null
}


export function bombsOfPlayer(aiInfo: TAiInfo, player: number): TAiBombInfo[] {
    return aiInfo.Bombs.filter(bomb => bomb.Owner === player)
}

export function fieldValue(aiInfo: TAiInfo, x: number, y: number): TAiField {
    return aiInfo.Field?.[x]?.[y]
}

export function teamplayer(aiInfo: TAiInfo, player1: number, player2: number): boolean {
    return aiInfo.Teamplay &&
        playerInfo(aiInfo, player1)?.Team === playerInfo(aiInfo, player2)?.Team
}

export function hasAbilities(aiInfo: TAiInfo, player: number, abilities: TAiAbilities) {
    return (playerInfo(aiInfo, player).Abilities & abilities) === abilities
}

export function isPowerUpAt(aiInfo: TAiInfo, position: TAiVector2, positiveEffectOnly: boolean = false): boolean {
    const field = fieldValue(aiInfo, position.x, position.y)
    const max = positiveEffectOnly ? TAiField.fJelly : TAiField.fBadDisease

    return field >= TAiField.fExtraBomb && field <= max
}

export function isWalkable(aiInfo: TAiInfo, position: TAiVector2): boolean {
    const field = fieldValue(aiInfo, position.x, position.y)

    return field === TAiField.fBlank ||
        (field >= TAiField.fHole && field <= TAiField.fArrowRight)
}

export const AiMoveStateAsString: string[] = ["None", "Left", "Right", "Up", "Down"]
export const TAiFieldAsString: string[] = ["Blank", "Brick", "Solid", "Hole", "Tramp", "ConveyorUp", "ConveyorDown", "ConveyorLeft", "ConveyorRight", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Flame", "ExtraBomb", "LongerFlame", "Goldflame", "ExtraSpeed", "Kick", "Spooger", "Punch", "Grab", "Trigger", "Jelly", "Random", "Slow", "Disease", "BadDisease"]
export const AiActionAsString: string[] = ["None", "First", "FirstDouble", "Second", "SecondDouble"]

export const moveDirections: AiMoveState[] = [
    AiMoveState.amNone,
    AiMoveState.amUp,
    AiMoveState.amRight,
    AiMoveState.amDown,
    AiMoveState.amLeft]

export const DEAD_VALUE = -9999
export const INCOMING_THREAD_VALUE_MIN = DEAD_VALUE + 1
export const INCOMING_THREAD_VALUE_MAX = DEAD_VALUE + 500 // = -9999 + 500 = -9499

export const fieldThreats: { key: TAiField; value: number }[] = [
    { key: TAiField.fBlank, value: 0 },
    { key: TAiField.fBrick, value: DEAD_VALUE },
    { key: TAiField.fSolid, value: DEAD_VALUE },
    { key: TAiField.fHole, value: 0 },
    { key: TAiField.fTramp, value: 0 },
    { key: TAiField.fConveyorUp, value: 0 },
    { key: TAiField.fConveyorDown, value: 0 },
    { key: TAiField.fConveyorLeft, value: 0 },
    { key: TAiField.fConveyorRight, value: 0 },
    { key: TAiField.fArrowUp, value: 0 },
    { key: TAiField.fArrowDown, value: 0 },
    { key: TAiField.fArrowLeft, value: 0 },
    { key: TAiField.fArrowRight, value: 0 },
    { key: TAiField.fFlame, value: DEAD_VALUE },
    { key: TAiField.fExtraBomb, value: 1 },
    { key: TAiField.fLongerFlame, value: 1 },
    { key: TAiField.fGoldflame, value: 1 },
    { key: TAiField.fExtraSpeed, value: 1 },
    { key: TAiField.fKick, value: 1 },
    { key: TAiField.fSpooger, value: 1 },
    { key: TAiField.fPunch, value: 1 },
    { key: TAiField.fGrab, value: 1 },
    { key: TAiField.fTrigger, value: 1 },
    { key: TAiField.fJelly, value: 1 },
    { key: TAiField.fRandom, value: 0 },
    { key: TAiField.fSlow, value: -1 },
    { key: TAiField.fDisease, value: -10 },
    { key: TAiField.fBadDisease, value: -20 }
]