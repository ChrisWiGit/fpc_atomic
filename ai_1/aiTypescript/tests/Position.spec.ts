import Position from "../src/Environment/vector"

describe('Vector', () => {
  let position

  beforeEach(() => {

  })

  it('should create a new position', () => {
    position = Position.create(1, 1)
    expect(position).toBeDefined()
  })

  it('should move left', () => {
    position = Position.stepLeft({ x: 1, y: 1 })
    expect(position).toEqual({ x: 0, y: 1 })

    position = Position.stepLeft({ x: 0, y: 1 })
    expect(position).toEqual({ x: -1, y: 1 })

    position = Position.stepLeft({ x: 2, y: 1 })
    expect(position).toEqual({ x: 1, y: 1 })
  })

  it('should move right', () => {
    position = Position.stepRight({ x: 1, y: 1 })
    expect(position).toEqual({ x: 2, y: 1 })

    position = Position.stepRight({ x: 0, y: 1 })
    expect(position).toEqual({ x: 1, y: 1 })

    position = Position.stepRight({ x: -1, y: 1 })
    expect(position).toEqual({ x: 0, y: 1 })
  })

  it('should move stepUp', () => {
    position = Position.stepUp({ x: 1, y: 1 })
    expect(position).toEqual({ x: 1, y: 0 })

    position = Position.stepUp({ x: 0, y: 1 })
    expect(position).toEqual({ x: 0, y: 0 })

    position = Position.stepUp({ x: -1, y: 1 })
    expect(position).toEqual({ x: -1, y: 0 })
  })

  it('should move stepDown', () => {
    position = Position.stepDown({ x: 1, y: 1 })
    expect(position).toEqual({ x: 1, y: 2 })

    position = Position.stepDown({ x: 0, y: 1 })
    expect(position).toEqual({ x: 0, y: 2 })

    position = Position.stepDown({ x: -1, y: 1 })
    expect(position).toEqual({ x: -1, y: 2 })
  })

  it('should return identity', () => {
    position = Position.identity({ x: 1, y: 1 })
    expect(position).toEqual({ x: 1, y: 1 })

    position = Position.identity({ x: 0, y: 1 })
    expect(position).toEqual({ x: 0, y: 1 })

    position = Position.identity({ x: -1, y: 1 })
    expect(position).toEqual({ x: -1, y: 1 })
  })

  it('should compare two positions', () => {
    expect(Position.equals({ x: 1, y: 1 }, { x: 1, y: 1 })).toBeTruthy()
    expect(Position.equals({ x: 0, y: 1 }, { x: 1, y: 1 })).toBeFalsy()
  })

  it('should check if position is in bounds', () => {
    expect(Position.inBounds({ x: 1, y: 1 }, 1, 1, 2, 2)).toBeTruthy()
    expect(Position.inBounds({ x: 2, y: 2 }, 1, 2, 2, 2)).toBeFalsy()
    expect(Position.inBounds({ x: 0, y: 0 }, 0, 0, 2, 2)).toBeTruthy()
    expect(Position.inBounds({ x: -1, y: -1 }, 0, 0, 2, 2)).toBeFalsy()
  })
})

/*
import { TAiVector2 } from "../AiInfoDef"

// Vektor Toolklasse
export default {
  create(x: number, y: number): TAiVector2 {
    return { x, y }
  },

  left(v: TAiVector2): TAiVector2 {
    return { x: Math.min(v.x - 1, 0), y: v.y }
  },
  right(v: TAiVector2): TAiVector2 {
    return { x: Math.max(v.x + 1, 0), y: v.y }
  },
  top(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: Math.max(v.y - 1, 0) }
  },
  bottom(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: Math.max(v.y + 1, 0) }
  },
  identity(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: v.y }
  },

  equals(v1: TAiVector2, v2: TAiVector2): boolean {
    return v1.x === v2.x && v1.y === v2.y
  },

  inBounds(v: TAiVector2, width: number, height: number): boolean {
    return v.x >= 0 && v.x < width && v.y >= 0 && v.y < height
  }



}
*/