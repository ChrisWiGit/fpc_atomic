import { playerPosition } from "../AiInfo";
import { AiAction, AiMoveState, TAiCommand, TAiInfo, TAiVector2, fieldHeight, fieldWidth } from "../AiInfoDef"

// key = radius, value = array of TAiVector2
const allRadius2dArray : {[radius: number]: TAiVector2[]} = {};
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

export default {
    getMaxDepths() {
        return Math.max(fieldHeight, fieldWidth)
    },
    initAllRadius2dArray: function() {
        const maxDept = this.getMaxDepths();

        for (let radius = 1; radius <= maxDept; radius++) {
            allRadius2dArray[radius] = this.createRadius2dArray(radius);
        }
    },
    /**
     * Erzeugt ein Array von TAiVector2, die ein Quadrat mit der Seitenlänge radius*2+1 bilden
     * @param radius 
     * @returns 
     */
    createRadius2dArray: function(radius: number): TAiVector2[] {
        let result: TAiVector2[] = [];

        // 0,0 ist die Mitte
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                result.push({x: x, y: y});
            }
        }

        /* Länge des Arrays ist damit
         (radius * 2 + 1) * (radius * 2 + 1)
        Beispiel: 
          radius = 2 : 5 * 5 = 25
          radius = 3 : 7 * 7 = 49
          radius = 10 : 21 * 21 = 441
         */
        
        return result;
    },

    /**
     * Gibt ein Array von TAiVector2 zurück, die den Spielerstandort um den Radius offsetieren
     * @param playerPosition
     * @param radius
     * @returns {TAiVector2[]} Liefert alle Positionen, die um den Radius offsetiert sind.
    */
    offsetPlayPos(playerPosition: TAiVector2, radius: number, allowOutOfBounds: boolean = false): TAiVector2[] {
        if (allowOutOfBounds) {
            return allRadius2dArray[radius].map((v) => {
                return {x: playerPosition.x + v.x, y: playerPosition.y + v.y};
            });
        }

        return allRadius2dArray[radius].filter((v) => {
            return (playerPosition.x + v.x >= 0) && (playerPosition.x + v.x < fieldWidth) &&
                (playerPosition.y + v.y >= 0) && (playerPosition.y + v.y < fieldHeight);
        }).map((v) => {
            return {x: playerPosition.x + v.x, y: playerPosition.y + v.y};
        });
    },
    offsetPlayPosAllowOutOfBounds(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        return this.offsetPlayPos(playerPosition, radius, true);
    },

    // 
    createBeamNorth(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        let result: TAiVector2[] = [];

        let y = playerPosition.y - 1;
        const playerRadius = Math.max(0, playerPosition.y - radius);

        while (y >= 0 && y >= playerRadius) {
            result.push({x: playerPosition.x, y: y});
            y--;
        }

        return result;
    },

    createBeamSouth(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        let result: TAiVector2[] = [];

        let y = playerPosition.y + 1;
        const playerRadius = Math.min(fieldHeight - 1, playerPosition.y + radius);

        while (y < fieldHeight && y <= playerRadius) {
            result.push({x: playerPosition.x, y: y});
            y++;
        }

        return result;
    },

    createBeamWest(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        let result: TAiVector2[] = [];

        let x = playerPosition.x - 1;
        const playerRadius = Math.max(0, playerPosition.x - radius);

        while (x >= 0 && x >= playerRadius) {
            result.push({x: x, y: playerPosition.y});
            x--;
        }
        return result;
    },

    createBeamEast(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        let result: TAiVector2[] = [];

        let x = playerPosition.x + 1;
        const playerRadius = Math.min(fieldWidth - 1, playerPosition.x + radius);

        while (x < fieldWidth && x <= playerRadius) {
            result.push({x: x, y: playerPosition.y});
            x++;
        }

        return result;
    },

    /**
     * Liefert ein Array von TAiVector2, die die Positionen der Strahlen um den Spieler herum enthalten.
     * Der Array ist 2d, d.h. damit werden die Strahlen in Nord, Süd, West und Ost Richtung beschrieben.
     * @param {TAiVector2} playerPosition Die Position des Spielers
     * @param {number} radius Der Radius, in dem die Strahlen erzeugt werden sollen.
     * @returns Enthält die Strahlen in Nord, Süd, West und Ost Richtung.
     */
    createBeams(playerPosition: TAiVector2, radius: number): TAiVector2[][] {
        return [
            this.createBeamNorth(playerPosition, radius),
            this.createBeamSouth(playerPosition, radius),
            this.createBeamWest(playerPosition, radius),
            this.createBeamEast(playerPosition, radius)
        ];
    },

    /**
     * Liefer ein Array von TAiVector2, die den Spielerstandort um den Radius offsetieren
     * @param {TAiVector2} playerPosition Die Position des Spielers
     * @param {number} radius Der Radius, in dem die Strahlen erzeugt werden sollen.
     * @returns {TAiVector2[]} Liefert alle Positionen, die um den Radius offsetiert sind.
     */
    createBeamsArray: function(playerPosition: TAiVector2, radius: number): TAiVector2[] {
        return [...this.createBeamNorth(playerPosition, radius),
                ...this.createBeamSouth(playerPosition, radius),
                ...this.createBeamWest(playerPosition, radius),
                ...this.createBeamEast(playerPosition, radius)];
        
    }
}



