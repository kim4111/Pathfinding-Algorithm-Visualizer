var canvas;
var ctx;
var WIDTH = 1200;
var HEIGHT = 800;

tileW = 20;
tileH = 20;

tileRowCount = 25;
tileColumnCount = 43;

dragok = false;
boundX = 0;
boundY = 0;
endPoints = false;

resetFunction = false;
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    })
}


var tiles = [];
for (i = 0; i < tileColumnCount; i++) {
    tiles[i] = [];
    for (j = 0; j < tileRowCount; j++) {
        tiles[i][j] = {x: i*(tileW + 3), y: j*(tileH + 3), state: 'e'};  //state e for empty
    }
}

startX = 0;
startY = 0;
endX = tileColumnCount - 1;
endY = tileRowCount - 1;


tiles[startX][startY].state = 's';
tiles[endX][endY].state = 'f';

function rect(x,y,w,h,state) {
    if (state == 's') {
        ctx.fillStyle = '#00FF00'; //start
    } else if (state == 'f') {
        ctx.fillStyle = '#FF0000'; //finish
    } else if (state == 'e') {
        ctx.fillStyle = '#AAAAAA'; //White, not used
    } else if (state == 'w') {
        ctx.fillStyle = '#0000FF'; //blue, walls
    } else if (state == 'x') {
        ctx.fillStyle = '#000000'; //black, way to find
    } else {
        ctx.fillStyle = '#FFFF00'; //Yellow
    }

    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0,0,WIDTH,HEIGHT);
}

function draw() {
    clear();    
    for (i = 0; i < tileColumnCount; i++) {
        for (j = 0; j < tileRowCount; j++) {
            rect(tiles[i][j].x, tiles[i][j].y, tileW, tileH, tiles[i][j].state);
        }
    }
}


async function solveMaze() { //A* search algorithm

    resetFunction = false;
    let option = document.getElementById("select-algorithm").value;
    console.log(option);
    var speed = document.getElementById("speed").value;
    if (speed == "Fastest") speed = 5;
    else if (speed == "Fast") speed = 15;
    else if (speed == "Slow") speed = 50;
    else if (speed = "Slowest") speed = 100;
    else if (speed == "Medium") speed = 30;


    if (option == "A* Search Algorithm") {
        aAlgorithmSearch(speed);
    }

}

async function aAlgorithmSearch(speed) {
    var Xqueue = [0];
    var Yqueue = [0];

    var pathFound = false;
    var xLocation;
    var yLocation;
    
    while (Xqueue.length > 0 && !pathFound && !resetFunction) {
        xLocation = Xqueue.shift();
        yLocation = Yqueue.shift();
  

        if (xLocation > 0 && tiles[xLocation - 1][yLocation].state == 'f') {
            pathFound = true;          
        }
        if (xLocation < tileColumnCount - 1 && tiles[xLocation + 1][yLocation].state == 'f') {
            pathFound = true;          
        }
        if (yLocation > 0 && tiles[xLocation][yLocation - 1].state == 'f') {
            pathFound = true;          
        }
        if (yLocation < tileRowCount - 1 && tiles[xLocation][yLocation + 1].state == 'f') {
            pathFound = true;          
        }


        if (xLocation > 0 && tiles[xLocation - 1][yLocation].state == 'e') {
            Xqueue.push(xLocation - 1);
            Yqueue.push(yLocation);
            tiles[xLocation - 1][yLocation].state = tiles[xLocation][yLocation].state + "l";
        }
        if (xLocation < tileColumnCount - 1 && tiles[xLocation + 1][yLocation].state == 'e') {
            Xqueue.push(xLocation + 1);
            Yqueue.push(yLocation);
            tiles[xLocation + 1][yLocation].state = tiles[xLocation][yLocation].state + "r";
        }
        if (yLocation > 0 && tiles[xLocation][yLocation - 1].state == 'e') {
            Xqueue.push(xLocation);
            Yqueue.push(yLocation - 1);
            tiles[xLocation][yLocation - 1].state = tiles[xLocation][yLocation].state + "u";
        }
        if (yLocation < tileRowCount - 1 && tiles[xLocation][yLocation + 1].state == 'e') {
            Xqueue.push(xLocation);
            Yqueue.push(yLocation + 1);
            tiles[xLocation][yLocation + 1].state = tiles[xLocation][yLocation].state + "d";
        }
        await sleep(speed);
    }
    if (!pathFound && !resetFunction) {
        output.innerHTML = 'No Solution';
    } else if (pathFound) {
        output.innerHTML = 'Success!';
        var path = tiles[xLocation][yLocation].state;
        var pathLength = path.length;
        var currX = 0;
        var currY = 0;

        for (var i = 0; i < pathLength - 1; i++) {
            if (path.charAt(i+1) == 'u') {
                currY -= 1;
            }
            if (path.charAt(i+1) == 'd') {
                currY += 1;
            }
            if (path.charAt(i+1) == 'r') {
                currX += 1;
            }
            if (path.charAt(i+1) == 'l') {
                currX -= 1;
            }
            tiles[currX][currY].state = 'x';
            await sleep(20);

        }
    }
}

function reset() {
    resetFunction = true;
    for (i = 0; i < tileColumnCount; i++) {
        tiles[i] = [];
        for (j = 0; j < tileRowCount; j++) {
            tiles[i][j] = {x: i*(tileW + 3), y: j*(tileH + 3), state: 'e'};  //state e for empty
        }
    }
    
    tiles[0][0].state = 's';
    tiles[tileColumnCount - 1][tileRowCount - 1].state = 'f';
    output.innerHTML = "";

    document.getElementById("select-algorithm").selectedIndex = 0;;
}


function init() {
    canvas = document.getElementById("myCanvas");
    ctx = canvas.getContext("2d");
    output = document.getElementById("outcome");
    return setInterval(draw, 1);
}

function myMove(e) {
    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;


    for (i = 0; i < tileColumnCount; i++) {
        for (j = 0; j < tileRowCount; j++) {
            if (i*(tileW+3) < x && x < i*(tileW+3)+tileW && j*(tileH+3) < y && y < j*(tileH+3) + tileH) {
                if (tiles[i][j].state == "e" && (i != boundX || j != boundY)) {
                    tiles[i][j].state = "w";
                    boundX = i;
                    boundY = j;
                }
                else if (tiles[i][j].state == "w" && (i != boundX || j != boundY)) {
                    tiles[i][j].state = "e";
                    boundX = i;
                    boundY = j;
                }
            }

        }
    }
}

function myDown(e) {
    canvas.onmousemove = myMove;
    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;
    for (i = 0; i < tileColumnCount; i++) {
        for (j = 0; j < tileRowCount; j++) {
            if (i*(tileW+3) < x && x < i*(tileW+3)+tileW && j*(tileH+3) < y && y < j*(tileH+3) + tileH) {
                if (tiles[i][j].state == "e") {
                    tiles[i][j].state = "w";
                    boundX = i;
                    boundY = j;
                }
                else if (tiles[i][j].state == "w") {
                    tiles[i][j].state = "e";
                    boundX = i;
                    boundY = j;
                }
            }

        }
    }
}

function myUp() {
    canvas.onmousemove = null;
}




init();
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
