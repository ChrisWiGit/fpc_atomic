import radius from "../src/Environment/radius";
import Position from "../src/Environment/vector";
import { AiAction, AiMoveState, TAiCommand, TAiInfo, TAiVector2, fieldHeight, fieldWidth, fieldLastX, fieldLastY } from "../src/AiInfoDef";


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

describe('radius', () => {
    beforeAll(() => {
        radius.initAllRadius2dArray();
    });

    it('createRadius2dArray 1', () => {
        const result = radius.createRadius2dArray(1);
        expect(result).toBeDefined();
        // 3
        // 1 + 1
        // 3
        expect(result.length).toBe(9);
    });

    it('createRadius2dArray 3', () => {
        const result = radius.createRadius2dArray(2);
        expect(result).toBeDefined();
        // 4 Seiten. Die Berechnung erfolgt dann mit 
        // radius * 6 + 4 * radius
        expect(result.length).toBe(25);

    });

    it('createRadius2dArray 10', () => {
        const result = radius.createRadius2dArray(10);
        expect(result).toBeDefined();

        expect(result.length).toBe(441);

    });

    it('offsetPlayPos 1', () => {
        const result = radius.offsetPlayPos(Position.create(1, 1), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(9);

        /*
        - 0 1 2
        0 1 1 1
        1 1 X 1
        2 1 1 1

        Geht die Spalte zuerst durch, dann die Zeilen
        */


        expect(result[0]).toEqual(Position.create(0, 0));
        expect(result[1]).toEqual(Position.create(0, 1));
        expect(result[2]).toEqual(Position.create(0, 2));
        expect(result[3]).toEqual(Position.create(1, 0));
        expect(result[4]).toEqual(Position.create(1, 1));
        expect(result[5]).toEqual(Position.create(1, 2));
        expect(result[6]).toEqual(Position.create(2, 0));
        expect(result[7]).toEqual(Position.create(2, 1));
        expect(result[8]).toEqual(Position.create(2, 2));
    });
    it('offsetPlayPos 2', () => {
        const result = radius.offsetPlayPos(Position.create(2, 2), 2);
        expect(result).toBeDefined();
        expect(result.length).toBe(25);

        /*
        - 0 1 2 3 4
        0 2 2 2 2 2
        1 2 1 1 1 2
        2 2 1 X 1 2
        3 2 1 1 1 2
        4 2 2 2 2 2
        Geht die Spalte zuerst durch, dann die Zeilen
        */
        const expectedPositions = [
            Position.create(0, 0), Position.create(0, 1), Position.create(0, 2), Position.create(0, 3), Position.create(0, 4),
            Position.create(1, 0), Position.create(1, 1), Position.create(1, 2), Position.create(1, 3), Position.create(1, 4),
            Position.create(2, 0), Position.create(2, 1), Position.create(2, 2), Position.create(2, 3), Position.create(2, 4),
            Position.create(3, 0), Position.create(3, 1), Position.create(3, 2), Position.create(3, 3), Position.create(3, 4),
            Position.create(4, 0), Position.create(4, 1), Position.create(4, 2), Position.create(4, 3), Position.create(4, 4)
        ];
        
        expect(result).toEqual(expectedPositions);        
    });

    it('offsetPlayPos 1, allowOutOfBounds = false', () => {
        const result = radius.offsetPlayPos(Position.create(0, 0), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(4);

        /*
        - 0 1
        0 X 1 
        1 1 1 
        

        Geht die Spalte zuerst durch, dann die Zeilen
        */
        expect(result[0]).toEqual(Position.create(0, 0));
        expect(result[1]).toEqual(Position.create(0, 1));
        expect(result[2]).toEqual(Position.create(1, 0));
        expect(result[3]).toEqual(Position.create(1, 1));
    });

    it('offsetPlayPos 1, allowOutOfBounds = true', () => {
        const result = radius.offsetPlayPosAllowOutOfBounds(Position.create(0, 0), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(9);

        expect(result[0]).toEqual(Position.create(-1, -1));
        expect(result[1]).toEqual(Position.create(-1, 0));
        expect(result[2]).toEqual(Position.create(-1, 1));
        expect(result[3]).toEqual(Position.create(0, -1));
        expect(result[4]).toEqual(Position.create(0, 0));
        expect(result[5]).toEqual(Position.create(0, 1));
        expect(result[6]).toEqual(Position.create(1, -1));
        expect(result[7]).toEqual(Position.create(1, 0));
        expect(result[8]).toEqual(Position.create(1, 1));
    });

    it('createBeamNorth 1', () => {
        const result = radius.createBeamNorth(Position.create(1, 2), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        /*
        - 0 1 2 3
        0    
        1   B
        2   X
        */

        expect(result).toEqual([Position.create(1, 1)]);
    });
    
    it('createBeamNorth 2', () => {
        const result = radius.createBeamNorth(Position.create(1, 2), 2);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        /*
        - 0 1 2 3
        0   B  
        1   B
        2   X
        */

        expect(result).toEqual([Position.create(1, 1), Position.create(1, 0)]);
    });
    
    it('createBeamNorth 3', () => {
        const result = radius.createBeamNorth(Position.create(1, 2), 3);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        /*
        - 0 1 2 3
        0   B  
        1   B
        2   X
        */

        expect(result).toEqual([Position.create(1, 1), Position.create(1, 0)]);
    });

    it('createBeamSouth 1', () => {
        const result = radius.createBeamSouth(Position.create(1, fieldLastY - 1), 1);

        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        expect(result).toEqual([Position.create(1, fieldLastY)]);        
    });

    it('createBeamSouth 2', () => {
        const result = radius.createBeamSouth(Position.create(1, fieldLastY - 2), 2);

        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(1, fieldLastY - 1), Position.create(1, fieldLastY)]);        
    });

    it('createBeamSouth 3', () => {
        const result = radius.createBeamSouth(Position.create(1, fieldLastY - 2), 3);

        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(1, fieldLastY - 1), Position.create(1, fieldLastY)]);        
    });


    it('createBeamWest 1', () => {
        const result = radius.createBeamWest(Position.create(2, 1), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        expect(result).toEqual([Position.create(1, 1)]);        
    });

    it('createBeamWest 2', () => {
        const result = radius.createBeamWest(Position.create(2, 1), 2);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(1, 1), Position.create(0, 1)]);        
    });

    it('createBeamWest 3', () => {
        const result = radius.createBeamWest(Position.create(2, 1), 3);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(1, 1), Position.create(0, 1)]);        
    });

    it('createBeamEast 1', () => {
        const result = radius.createBeamEast(Position.create(fieldLastX - 1, 1), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);

        expect(result).toEqual([Position.create(fieldLastX, 1)]);        
    });

    it('createBeamEast 2', () => {
        const result = radius.createBeamEast(Position.create(fieldLastX - 2, 1), 2);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(fieldLastX - 1, 1), Position.create(fieldLastX, 1)]);        
    });

    it('createBeamEast 3', () => {
        const result = radius.createBeamEast(Position.create(fieldLastX - 2, 1), 3);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);

        expect(result).toEqual([Position.create(fieldLastX - 1, 1), Position.create(fieldLastX, 1)]);        
    });

    it('createBeams 1', () => {
        const result = radius.createBeams(Position.create(1, 1), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(4);

        // n, s, w, e beams
        expect(result).toEqual([[Position.create(1, 0)], [Position.create(1, 2)], [Position.create(0, 1)], [Position.create(2, 1)]]);
    });

    it('createBeams 2', () => {
        const result = radius.createBeams(Position.create(1, 1), 2);
        expect(result).toBeDefined();
        expect(result.length).toBe(4);
        expect(result[0].length).toBe(1);
        expect(result[1].length).toBe(2);
        expect(result[2].length).toBe(1);
        expect(result[3].length).toBe(2);


        /*
         - 0 1 2 3 4
         0   B
         1 B X B B
         2   B
         3   B
        */

        // n, s, w, e beams
        expect(result).toEqual(
            [
                [Position.create(1, 0)], 
                [Position.create(1, 2), Position.create(1, 3)], 
                [Position.create(0, 1)], 
                [Position.create(2, 1), Position.create(3, 1)]
            ]
        );
    });

    it('createBeamsArray 1', () => {
        const result = radius.createBeamsArray(Position.create(1, 1), 1);
        expect(result).toBeDefined();
        expect(result.length).toBe(4);

        // n, s, w, e beams
        expect(result).toEqual([Position.create(1, 0), Position.create(1, 2), Position.create(0, 1), Position.create(2, 1)]);        
    });


    it('createBeamsArray == [...createBeams]', () => {
        const result2d = radius.createBeams(Position.create(1, 1), 2);
        const result = radius.createBeamsArray(Position.create(1, 1), 2);
        expect(result).toBeDefined();
        expect(result2d).toBeDefined();
        expect(result2d.length).toBe(4);
        expect(result.length).toBe(6);

        // n, s, w, e beams
        const expected = [...result2d[0], ...result2d[1], ...result2d[2], ...result2d[3]];

        expect(result).toEqual(expected);
    });
});
