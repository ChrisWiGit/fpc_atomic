import { TAiVector2 } from "../AiInfoDef"

// Vektor Toolklasse
export default {
  create(x: number, y: number): TAiVector2 {
    return { x, y }
  },

  stepLeft(v: TAiVector2): TAiVector2 {
    return { x: v.x - 1, y: v.y }
  },
  stepRight(v: TAiVector2): TAiVector2 {
    return { x: v.x + 1, y: v.y }
  },
  stepUp(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: v.y - 1 }
  },
  stepDown(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: v.y + 1 }
  },
  identity(v: TAiVector2): TAiVector2 {
    return { x: v.x, y: v.y }
  },

  equals(v1: TAiVector2, v2: TAiVector2): boolean {
    return v1.x === v2.x && v1.y === v2.y
  },

  inBounds(v: TAiVector2, left: number, top: number, width: number, height: number): boolean {
    return v.x >= left && v.x < width && v.y >= top && v.y < height
  }
}