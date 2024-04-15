import { AiAction, AiMoveState, TAiCommand, TAiInfo, TAiField } 
    from "./AiInfoDef"


const aiFastField = {
    /*
    export enum TAiAbilities {
    Ability_CanKick = 1,
    Ability_CanSpoog = 2,
    Ability_CanPunch = 4,
    Ability_CanGrab = 8,
    Ability_CanTrigger = 16,
    Ability_CanJelly = 32,
}
     /* Bitfeld:
        0..64x
        00000000 0000000 00000000 00000000 00000000 00000000 00000000 00000000
        0..64y                                                        ^-- TAiField
                                                    11000000     
                                                    ^-- Spieler Gegner (FFA, Team)
                                                     ^-- Spieler Freund (Team)
                                                           ^ = TAiAbilities.CanKick (1)
                                                          ^ = TAiAbilities.CanSpoog (2)
                                                         ^ = TAiAbilities.CanPunch (4)
                                                        ^ = TAiAbilities.CanGrab (8)
                                                       ^ = TAiAbilities.CanTrigger (16)
                                                      ^ = TAiAbilities.CanJelly (32)
        10000000
        ^-- BombeFlamme (tödlich)
        00000001
               ^--- Bombe manal triggern               
                 0000000
                 ^---- Bombe von Spieler (0...7)
                                                      
        */ 
        /*
        export enum TAiField {
    fBlank = 0,
    fBrick = 1,
    fSolid = 2,
    fFlame = 3,
    fExtraBomb = 4,
    fLongerFlame = 5,
    fGoldflame = 6,
    fExtraSpeed = 7,
    fKick = 8,
    fSpooger = 9,
    fPunch = 10,
    fGrab = 11,
    fTrigger = 12,
    fJelly = 13,
    fRandom = 14,
    fSlow = 15,
    fDisease = 16,
    fBadDisease = 17
}
        */

    aiFieldToBitField(aiInfo: TAiInfo, fieldBitValue: number): number {       
        return 0
    }

    // convertFieldToBitField(field: TAiInfo): [[number]] {
    //     const bitField = new Array(15).fill(0).map(() => new Array(11).fill(0));
    //     for (let y = 0; y < 15; y++) {
    //         for (let x = 0; x < 11; x++) {
    //             // bitField[y][x] = field.Field[y][x].Type;
    //         }
    //     }
    //     return bitField;        
    // }


};

// export default ai;