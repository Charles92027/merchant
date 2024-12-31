'use strict';
import { WORLD } from "./world.js";

const GRASS = 0;
const OCEAN = 1;
const FOREST = 2;
const DESERT = 3;
const HILL = 4;
const MOUNTAIN = 5;
const RIVER = 6;
const STREAM = 7;
const DELTA = 10;

const map = WORLD.map;
const imagePaths = [
    'img/grass.gif', 
    'img/ocean.gif', 
    'img/forest.gif', 
    'img/desert.gif', 
    'img/hill.gif', 
    'img/mountain.gif', 
    'img/river.gif', 
    'img/stream.gif', 
    'img/delta.gif'
];
const images = [];

const tileWidth = 32;
const tileHeight = 32;



export class Mapper {

    #rows = 0;
    #cols = 0;
    #maxRow = 0;
    #maxCol = 0;
    #currentTile = {
        row: 0, col: 0,
        value: 0, tileSet: 0, index: 0,
        up: 0, right: 0, down: 0, left: 0,  
    };
    
    #ctx;
    

    constructor(canvas) {
        
        this.#ctx = canvas.getContext('2d');
        
        this.#rows = map.length;
        this.#cols = map[0].length;
        this.maxRow = this.#rows - 1;
        this.maxCol = this.#cols - 1;

        let imagesLoaded = 0;

        for (let index = 0; index < imagePaths.length; index++) {

            const img = new Image();

            img.src = imagePaths[index];
            
            img.onload = () => {
                imagesLoaded++;
                // if (imagesLoaded === imagePaths.length) {
                //     this.drawMap();
                // }
            };
            images.push(img);
        }
    }


drawMap() {

        this.#rows = map.length;
        this.#cols = map[0].length;
        this.#maxRow = this.#rows - 1;
        this.#maxCol = this.#cols - 1;

        let imagesLoaded = 0;

        for (let index = 0; index < imagePaths.length; index++) {

            const img = new Image();

            img.src = imagePaths[index];
            
            img.onload = () => {
                imagesLoaded++;
                if (imagesLoaded === imagePaths.length) {
                    this.#drawCanvas();
                }
            };
            images.push(img);
        }
}

 #drawCanvas() {


    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            
            this.#getTile(row, col);

            this.#ctx.drawImage(images[this.#currentTile.tileSet], 
                0, this.#currentTile.index * tileHeight, tileWidth, tileHeight, // source rectangle
                col * tileWidth, row * tileHeight, tileWidth, tileHeight // destination rectangle
            );
        }
    }
}

 #getTile(row, col) {

    this.#currentTile.row = row;
    this.#currentTile.col = col;
    this.#currentTile.value = map[row][col];
    this.#currentTile.tileSet = this.#currentTile.value;
    this.#currentTile.index = 0;

    this.#currentTile.up =  row > 0 ? map[row - 1][col] : this.#currentTile.value;  
    this.#currentTile.right = col < this.#maxCol ? map[row][col + 1] : this.#currentTile.value;
    this.#currentTile.down = row < this.#maxRow ? map[row + 1][col] : this.#currentTile.value;
    this.#currentTile.left = col > 0 ? map[row][col - 1] : this.#currentTile.value;

    let value = map[row][col];
    let index = 0;


    if (this.#currentTile.value == GRASS) {
        return this.#currentTile;
    }

    if (this.#currentTile.value == OCEAN) {
        return this.#ocean();
    }

    if (this.#currentTile.value == DELTA) {
        return this.#delta();
    }

    if (this.#currentTile.value == RIVER || this.#currentTile.value == STREAM) {
        return this.#waterway();
    }

    if (row > 0 && map[row - 1][col] != value) {
        index += 1;
    }

    if (col < this.#maxCol && map[row][col + 1] != value) {
        index += 2;
    }

    if (row < this.#maxRow && map[row + 1][col] != value) {
        index += 4;
    }

    if (col > 0 && map[row][col - 1] != value) {
        index += 8;
    }

    this.#currentTile.index = index;
    return this.#currentTile;
}

 #isWaterway(value) {
    return (value >= RIVER);
}

 #isWater(value) {
    return (value == OCEAN || this.#isWaterway(value));
}

 #isFreshWater(value) {
    return (value == RIVER || value == STREAM);
}

 #isSaltWater(value) {
    return (value == DELTA || value == OCEAN);
}

 #ocean() {

    let index = 0;

    if (!this.#isSaltWater(this.#currentTile.up)) {
        index += 1;
    }

    if (!this.#isSaltWater(this.#currentTile.right)) {
        index += 2;
    }

    if (!this.#isSaltWater(this.#currentTile.down)) {
        index += 4;
    }

    if (!this.#isSaltWater(this.#currentTile.left)) {
        index += 8;
    }

    this.#currentTile.index = index;
    return this.#currentTile;
}

 #waterway() {

    let index = 0;

    if (this.#isWaterway(this.#currentTile.up)) {
        index += 1;
    }

    if (this.#isWaterway(this.#currentTile.right)) {
        index += 2;
    }

    if (this.#isWaterway(this.#currentTile.down)) {
        index += 4;
    }

    if (this.#isWaterway(this.#currentTile.left)) {
        index += 8;
    }

    this.#currentTile.index = index;
    
    return this.#currentTile;
}

 #delta() {

    // THERE HAS GOT TO BE A BETTER WAY TO DO THIS

    this.#currentTile.tileSet = 8;
    let up = this.#isWater(this.#currentTile.up) ? this.#currentTile.up : 0;
    let right = this.#isWater(this.#currentTile.right) ? this.#currentTile.right : 0;
    let down = this.#isWater(this.#currentTile.down) ? this.#currentTile.down : 0;
    let left = this.#isWater(this.#currentTile.left) ? this.#currentTile.left : 0;
    
    if (up == OCEAN && this.#isFreshWater(right) && down == 0 && left == 0) {this.#currentTile.index = 1; return this.#currentTile;}
    if (up == OCEAN && right == 0 && this.#isFreshWater(down) && left == 0) {this.#currentTile.index = 2; return this.#currentTile;}
    if (up == OCEAN && right == 0 && down == 0 && this.#isFreshWater(left)) {this.#currentTile.index = 3; return this.#currentTile;} 
    if (this.#isFreshWater(up) && right == OCEAN && down == 0 && left == 0) {this.#currentTile.index = 4; return this.#currentTile;}
    if (up == 0 && right == OCEAN && this.#isFreshWater(down) && left == 0) {this.#currentTile.index = 5; return this.#currentTile;}
    if (up == 0 && right == OCEAN && down == 0 && this.#isFreshWater(left)) {this.#currentTile.index = 6; return this.#currentTile;}
    if (this.#isFreshWater(up) && right == 0 && down == OCEAN && left == 0) {this.#currentTile.index = 7; return this.#currentTile;}
    if (up == 0 && this.#isFreshWater(right) && down == OCEAN && left == 0) {this.#currentTile.index = 8; return this.#currentTile;}
    if (up == 0 && right == 0 && down == OCEAN && this.#isFreshWater(left)) {this.#currentTile.index = 9; return this.#currentTile;}
    if (this.#isFreshWater(up) && right == 0 && down == 0 && left == OCEAN) {this.#currentTile.index = 10; return this.#currentTile;}
    if (up == 0 && this.#isFreshWater(right) && down == 0 && left == OCEAN) {this.#currentTile.index = 11; return this.#currentTile;} 
    if (up == 0 && right == OCEAN && this.#isFreshWater(down) && left == 0) {this.#currentTile.index = 12; return this.#currentTile;}

    if (up == RIVER && right == STREAM && down == 0 && left == 0) {this.#currentTile.index = 13; return this.#currentTile;}
    if (up == RIVER && right == 0 && down == STREAM && left == 0) {this.#currentTile.index = 14; return this.#currentTile;}
    if (up == RIVER && right == 0 && down == 0 && left == STREAM) {this.#currentTile.index = 15; return this.#currentTile;}
    if (up == STREAM && right == RIVER && down == 0 && left == 0) {this.#currentTile.index = 16; return this.#currentTile;}
    if (up == 0 && right == RIVER && down == STREAM && left == 0) {this.#currentTile.index = 17; return this.#currentTile;}
    if (up == 0 && right == RIVER && down == 0 && left == STREAM) {this.#currentTile.index = 18; return this.#currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == 0) {this.#currentTile.index = 19; return this.#currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == 0) {this.#currentTile.index = 20; return this.#currentTile;}   
    if (up == 0 && right == 0 && down == RIVER && left == STREAM) {this.#currentTile.index = 21; return this.#currentTile;}
    if (up == STREAM && right == 0 && down == 0 && left == RIVER) {this.#currentTile.index = 22; return this.#currentTile;}
    if (up == 0 && right == STREAM && down == 0 && left == RIVER) {this.#currentTile.index = 23; return this.#currentTile;}
    if (up == 0 && right == 0 && down == STREAM && left == RIVER) {this.#currentTile.index = 24; return this.#currentTile;}

    if (up == RIVER && right == STREAM && down == STREAM && left == 0) {this.#currentTile.index = 25; return this.#currentTile;}
    if (up == RIVER && right == STREAM && down == 0 && left == STREAM) {this.#currentTile.index = 26; return this.#currentTile;}    
    if (up == RIVER && right == 0 && down == STREAM && left == STREAM) {this.#currentTile.index = 27; return this.#currentTile;}
    if (up == 0 && right == RIVER && down == STREAM && left == STREAM) {this.#currentTile.index = 28; return this.#currentTile;}
    if (up == STREAM && right == RIVER && down == STREAM && left == 0) {this.#currentTile.index = 29; return this.#currentTile;}
    if (up == STREAM && right == RIVER && down == 0 && left == STREAM) {this.#currentTile.index = 30; return this.#currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == STREAM) {this.#currentTile.index = 31; return this.#currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == STREAM) {this.#currentTile.index = 32; return this.#currentTile;}
    if (up == STREAM && right == STREAM && down == RIVER && left == 0) {this.#currentTile.index = 33; return this.#currentTile;}     
    if (up == STREAM && right == STREAM && down == 0 && left == RIVER) {this.#currentTile.index = 34; return this.#currentTile;}
    if (up == STREAM && right == 0 && down == STREAM && left == RIVER) {this.#currentTile.index = 35; return this.#currentTile;}
    if (up == 0 && right == STREAM && down == STREAM && left == RIVER) {this.#currentTile.index = 36; return this.#currentTile;}
    if (up == STREAM && right == RIVER && down == RIVER && left == 0) {this.#currentTile.index = 37; return this.#currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == RIVER) {this.#currentTile.index = 38; return this.#currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == RIVER) {this.#currentTile.index = 39; return this.#currentTile;}
    if (up == RIVER && right == STREAM && down == 0 && left == RIVER) {this.#currentTile.index = 40; return this.#currentTile;}
    if (up == RIVER && right == 0 && down == STREAM && left == RIVER) {this.#currentTile.index = 41; return this.#currentTile;}
    if (up == RIVER && right == RIVER && down == STREAM && left == 0) {this.#currentTile.index = 42; return this.#currentTile;}
    if (up == RIVER && right == RIVER && down == 0 && left == STREAM) {this.#currentTile.index = 43; return this.#currentTile;}
    if (up == 0 && right == RIVER && down == RIVER && left == STREAM) {this.#currentTile.index = 44; return this.#currentTile;}

    this.#currentTile.index = 0;
    return this.#currentTile;
}


}