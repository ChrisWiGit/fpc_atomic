import GameState from "../SearchBeam/GameState"




export type AiMemoryEntity = {
time: number,
gameState: GameState,
diffs: any[]
}


let instance: AiMemory

export default function(maxMemory: number = 100) : IAiMemory {
  if (!instance) {
    instance = new AiMemory(maxMemory)
  }
  return instance
} 

export interface IAiMemory {
  getMemory(player: number): AiMemoryEntity[]
  putMemory(player: number, gameState: GameState, diffs: any[]): void
}

export class AiMemory implements IAiMemory {
  private maxMemory = 100
  
  private memory: {
    [player: number]: AiMemoryEntity[]
  } = {}
  
  constructor(maxMemory: number = 100) {
    this.maxMemory = maxMemory
  }

  getMemory(player: number) : AiMemoryEntity[] {
    return this.memory[player] || []
  }

  putMemory(player: number, gameState: GameState, diffs: any[]) {
    if (!this.memory[player]) {
      this.memory[player] = []
    }
    // nur 100 Einträge behalten
    if (this.memory[player].length > this.maxMemory) {
      this.memory[player].shift()
    }
    this.memory[player].push({
      time: Date.now(),
      gameState: gameState,
      diffs: diffs
    })
  }

  getMaxMemory() {
    return this.maxMemory
  }

}