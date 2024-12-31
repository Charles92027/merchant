'use strict';

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

let rows = 0;
let cols = 0;
let maxRow = 0;
let maxCol = 0;
let currentTile = {
    row: 0, col: 0,
    value: 0, tileSet: 0, index: 0,
    up: 0, right: 0, down: 0, left: 0,  
};

let ctx;

function drawMap(canvas) {

    ctx = canvas.getContext('2d');
    
    rows = map.length;
    cols = map[0].length;
    maxRow = rows - 1;
    maxCol = cols - 1;

    let imagesLoaded = 0;

    for (let index = 0; index < imagePaths.length; index++) {

        const img = new Image();

        img.src = imagePaths[index];
        
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === imagePaths.length) {
                drawCanvas();
            }
        };
        images.push(img);
    }
}

function drawCanvas() {


    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            
            getTile(row, col);

            ctx.drawImage(images[currentTile.tileSet], 
                0, currentTile.index * tileHeight, tileWidth, tileHeight, // source rectangle
                col * tileWidth, row * tileHeight, tileWidth, tileHeight // destination rectangle
            );
        }
    }
}

function getTile(row, col) {

    currentTile.row = row;
    currentTile.col = col;
    currentTile.value = map[row][col];
    currentTile.tileSet = currentTile.value;
    currentTile.index = 0;

    currentTile.up =  row > 0 ? map[row - 1][col] : currentTile.value;  
    currentTile.right = col < maxCol ? map[row][col + 1] : currentTile.value;
    currentTile.down = row < maxRow ? map[row + 1][col] : currentTile.value;
    currentTile.left = col > 0 ? map[row][col - 1] : currentTile.value;

    let value = map[row][col];
    let index = 0;


    if (currentTile.value == GRASS) {
        return currentTile;
    }

    if (currentTile.value == OCEAN) {
        return ocean();
    }

    if (currentTile.value == DELTA) {
        return delta();
    }

    if (currentTile.value == RIVER || currentTile.value == STREAM) {
        return waterway();
    }

    if (row > 0 && map[row - 1][col] != value) {
        index += 1;
    }

    if (col < maxCol && map[row][col + 1] != value) {
        index += 2;
    }

    if (row < maxRow && map[row + 1][col] != value) {
        index += 4;
    }

    if (col > 0 && map[row][col - 1] != value) {
        index += 8;
    }

    currentTile.index = index;
    return currentTile;
}

function isWaterway(value) {
    return (value >= RIVER);
}

function isWater(value) {
    return (value == OCEAN || isWaterway(value));
}

function isFreshWater(value) {
    return (value == RIVER || value == STREAM);
}

function isSaltWater(value) {
    return (value == DELTA || value == OCEAN);
}

function ocean() {

    let index = 0;

    if (!isSaltWater(currentTile.up)) {
        index += 1;
    }

    if (!isSaltWater(currentTile.right)) {
        index += 2;
    }

    if (!isSaltWater(currentTile.down)) {
        index += 4;
    }

    if (!isSaltWater(currentTile.left)) {
        index += 8;
    }

    currentTile.index = index;
    return currentTile;
}

function waterway() {

    let index = 0;

    if (isWaterway(currentTile.up)) {
        index += 1;
    }

    if (isWaterway(currentTile.right)) {
        index += 2;
    }

    if (isWaterway(currentTile.down)) {
        index += 4;
    }

    if (isWaterway(currentTile.left)) {
        index += 8;
    }

    currentTile.index = index;
    
    return currentTile;
}

function delta() {

    // THERE HAS GOT TO BE A BETTER WAY TO DO THIS

    currentTile.tileSet = 8;
    let up = isWater(currentTile.up) ? currentTile.up : 0;
    let right = isWater(currentTile.right) ? currentTile.right : 0;
    let down = isWater(currentTile.down) ? currentTile.down : 0;
    let left = isWater(currentTile.left) ? currentTile.left : 0;
    
    if (up == OCEAN && isFreshWater(right) && down == 0 && left == 0) {currentTile.index = 1; return currentTile;}
    if (up == OCEAN && right == 0 && isFreshWater(down) && left == 0) {currentTile.index = 2; return currentTile;}
    if (up == OCEAN && right == 0 && down == 0 && isFreshWater(left)) {currentTile.index = 3; return currentTile;} 
    if (isFreshWater(up) && right == OCEAN && down == 0 && left == 0) {currentTile.index = 4; return currentTile;}
    if (up == 0 && right == OCEAN && isFreshWater(down) && left == 0) {currentTile.index = 5; return currentTile;}
    if (up == 0 && right == OCEAN && down == 0 && isFreshWater(left)) {currentTile.index = 6; return currentTile;}
    if (isFreshWater(up) && right == 0 && down == OCEAN && left == 0) {currentTile.index = 7; return currentTile;}
    if (up == 0 && isFreshWater(right) && down == OCEAN && left == 0) {currentTile.index = 8; return currentTile;}
    if (up == 0 && right == 0 && down == OCEAN && isFreshWater(left)) {currentTile.index = 9; return currentTile;}
    if (isFreshWater(up) && right == 0 && down == 0 && left == OCEAN) {currentTile.index = 10; return currentTile;}
    if (up == 0 && isFreshWater(right) && down == 0 && left == OCEAN) {currentTile.index = 11; return currentTile;} 
    if (up == 0 && right == OCEAN && isFreshWater(down) && left == 0) {currentTile.index = 12; return currentTile;}

    if (up == RIVER && right == STREAM && down == 0 && left == 0) {currentTile.index = 13; return currentTile;}
    if (up == RIVER && right == 0 && down == STREAM && left == 0) {currentTile.index = 14; return currentTile;}
    if (up == RIVER && right == 0 && down == 0 && left == STREAM) {currentTile.index = 15; return currentTile;}
    if (up == STREAM && right == RIVER && down == 0 && left == 0) {currentTile.index = 16; return currentTile;}
    if (up == 0 && right == RIVER && down == STREAM && left == 0) {currentTile.index = 17; return currentTile;}
    if (up == 0 && right == RIVER && down == 0 && left == STREAM) {currentTile.index = 18; return currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == 0) {currentTile.index = 19; return currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == 0) {currentTile.index = 20; return currentTile;}   
    if (up == 0 && right == 0 && down == RIVER && left == STREAM) {currentTile.index = 21; return currentTile;}
    if (up == STREAM && right == 0 && down == 0 && left == RIVER) {currentTile.index = 22; return currentTile;}
    if (up == 0 && right == STREAM && down == 0 && left == RIVER) {currentTile.index = 23; return currentTile;}
    if (up == 0 && right == 0 && down == STREAM && left == RIVER) {currentTile.index = 24; return currentTile;}

    if (up == RIVER && right == STREAM && down == STREAM && left == 0) {currentTile.index = 25; return currentTile;}
    if (up == RIVER && right == STREAM && down == 0 && left == STREAM) {currentTile.index = 26; return currentTile;}    
    if (up == RIVER && right == 0 && down == STREAM && left == STREAM) {currentTile.index = 27; return currentTile;}
    if (up == 0 && right == RIVER && down == STREAM && left == STREAM) {currentTile.index = 28; return currentTile;}
    if (up == STREAM && right == RIVER && down == STREAM && left == 0) {currentTile.index = 29; return currentTile;}
    if (up == STREAM && right == RIVER && down == 0 && left == STREAM) {currentTile.index = 30; return currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == STREAM) {currentTile.index = 31; return currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == STREAM) {currentTile.index = 32; return currentTile;}
    if (up == STREAM && right == STREAM && down == RIVER && left == 0) {currentTile.index = 33; return currentTile;}     
    if (up == STREAM && right == STREAM && down == 0 && left == RIVER) {currentTile.index = 34; return currentTile;}
    if (up == STREAM && right == 0 && down == STREAM && left == RIVER) {currentTile.index = 35; return currentTile;}
    if (up == 0 && right == STREAM && down == STREAM && left == RIVER) {currentTile.index = 36; return currentTile;}
    if (up == STREAM && right == RIVER && down == RIVER && left == 0) {currentTile.index = 37; return currentTile;}
    if (up == STREAM && right == 0 && down == RIVER && left == RIVER) {currentTile.index = 38; return currentTile;}
    if (up == 0 && right == STREAM && down == RIVER && left == RIVER) {currentTile.index = 39; return currentTile;}
    if (up == RIVER && right == STREAM && down == 0 && left == RIVER) {currentTile.index = 40; return currentTile;}
    if (up == RIVER && right == 0 && down == STREAM && left == RIVER) {currentTile.index = 41; return currentTile;}
    if (up == RIVER && right == RIVER && down == STREAM && left == 0) {currentTile.index = 42; return currentTile;}
    if (up == RIVER && right == RIVER && down == 0 && left == STREAM) {currentTile.index = 43; return currentTile;}
    if (up == 0 && right == RIVER && down == RIVER && left == STREAM) {currentTile.index = 44; return currentTile;}

    currentTile.index = 0;
    return currentTile;
}

