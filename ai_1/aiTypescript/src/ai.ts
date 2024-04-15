import { AiAction, AiMoveState, TAiCommand, TAiInfo, TAiVector2 } from "./AiInfoDef"

// Exportiere die Funktion NewRound
export function NewRound(Strength: number): void {
  // Implementiere die Funktion NewRound
  console.log(`New Round. Strength ${Strength}}`)


}1

// Exportiere die Funktion Update
export function Update(AiInfo: TAiInfo): TAiCommand {
  // Implementiere die Funktion Update

  // console.log(`new info for player ${AiInfo.player}`)

  return { Action: AiAction.apNone, 
    MoveState: AiMoveState.amLeft } as TAiCommand
}

function GetWeightedDistance(Start: TAiVector2, End: TAiVector2): number {
  return 0

}

function GetDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2))
}

function GetNearestDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.min(Math.abs(x1 - x2), Math.abs(y1 - y2))
}

function Dijkstra(x1: number, y1: number, x2: number, y2: number) {

}

function GetNearestEnemy(player: number, AiInfo: TAiInfo): number {
  // get nearest enemy
  let nearestEnemy = -1
  let nearestDistance = 1000
  for (let i = 0; i < 10; i++) {
    if (i != player && AiInfo.PlayerInfos[i].Alive) {
      let distance = GetDistance(AiInfo.PlayerInfos[player].Position.x, AiInfo.PlayerInfos[player].Position.y, AiInfo.PlayerInfos[i].Position.x, AiInfo.PlayerInfos[i].Position.y)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestEnemy = i
      }
    }
  }
  return nearestEnemy
}

