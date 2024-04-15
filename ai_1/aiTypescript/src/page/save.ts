import { AiAction, AiMoveState, TAiCommand, TAiInfo, TAiField } from "../AiInfoDef"

export default {
  save(aiInfo: TAiInfo): string {
    const result = []

    result.push("; NOTE! This is an Atomic Bomberman Scheme File.")
    result.push("; Modify at your own risk.  It is machine-generated and updated.")
    result.push("")
    result.push("; this is an internal version control number")
    result.push("-V,2")
    result.push("")
    result.push("; this is the textual name of the scheme")
    result.push("-N,Unnamed (5)(5)")
    result.push("")
    result.push("; scheme brick density (0-100 percent)")
    result.push("-B,100")
    result.push("")
    result.push("; actual array data (# is solid, : is brick, . is blank)")
    result.push(";               11111")
    result.push(";     012345678901234")

    for (let x = 0; x < aiInfo.Field[0].length; x++) {
      const rowWithSpaceFrontPadding = x.toString().padStart(2, " ")
      const row = aiInfo.Field.map(f => f[x] === TAiField.fSolid ? "#" : f[x] === TAiField.fBrick ? ":" : ".")

      result.push("-R, " + rowWithSpaceFrontPadding + "," + row.join(""))
    }


    result.push("")
    result.push("; player starting locations (playerno,X,Y)")
    const visiblePlayers = aiInfo.PlayerInfos.filter(p => p.Position.x !== -1 && p.Position.y !== -1);
    for (let i = 0; i < visiblePlayers.length; i++) {
      result.push(`-S,${i},${visiblePlayers[i].Position.x},${visiblePlayers[i].Position.y}`)
    }

    result.push("")
    result.push("; powerup information; the fields are:")
    result.push(";   powerup #, bornwith, has_override, override_value, forbidden")
    result.push(";   (note the last text field has no effect; it is only a comment)")
    for (let i = 0; i < 13; i++) {
      result.push(`-P,${i}, 0,0, 0, 0,${i}`)
    }
    result.push("")

    return result.join("\r\n")
  }
}

/*

; NOTE! This is an Atomic Bomberman Scheme File.
; Modify at your own risk.  It is machine-generated and updated.


; this is an internal version control number
-V,2

; this is the textual name of the scheme
-N,Dog Race (5)(5)

; scheme brick density (0-100 percent)
-B,100

; actual array data (# is solid, : is brick, . is blank)
;               11111
;     012345678901234
-R, 0,#..#.#...#.#..#
-R, 1,#..#.#.:.#.#..#
-R, 2,##.#.#.:.#.#.##
-R, 3,::.:.:.:.:.:.::
-R, 4,::.:.:::::.:.::
-R, 5,#:#:#:::::#:#:#
-R, 6,::.:.:::::.:.::
-R, 7,::.:.:.:.:.:.::
-R, 8,##.#.#.:.#.#.##
-R, 9,#..#.#.:.#.#..#
-R,10,#..#.#...#.#..#

; player starting locations (playerno,X,Y)
-S,0,2,0,0
-S,1,4,0,0
-S,2,7,0,0
-S,3,10,0,0
-S,4,12,0,0
-S,5,2,10,1
-S,6,4,10,1
-S,7,7,10,1
-S,8,10,10,1
-S,9,12,10,1

; powerup information; the fields are:
;   powerup #, bornwith, has_override, override_value, forbidden
;   (note the last text field has no effect; it is only a comment)
-P, 0, 0,0, 0, 0,an extra bomb
-P, 1, 0,0, 0, 0,longer flame length
-P, 2, 0,0, 0, 0,a disease
-P, 3, 0,0, 0, 0,the ability to kick bombs
-P, 4, 0,0, 0, 0,extra speed
-P, 5, 0,0, 0, 0,the ability to punch bombs
-P, 6, 0,0, 0, 0,the ability to grab bombs
-P, 7, 0,0, 0, 0,the spooger
-P, 8, 0,0, 0, 0,goldflame
-P, 9, 0,0, 0, 0,a trigger mechanism
-P,10, 0,0, 0, 0,jelly (bouncy) bombs
-P,11, 0,0, 0, 0,super bad disease
-P,12, 0,0, 0, 0,random

*/