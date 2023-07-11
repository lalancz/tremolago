// tremola_go.js

"use strict";

const BLACK = "B";
const WHITE = "W";

let gamestate;          //0-80: field, 81: playerId, 82: playerPoints, 83: opponentId, 84: opponentPoints, 85; turn
let currentPlayer;
let playerColor;
let opponentColor;


function startTremolaGo(playerId, opponentId) {
    gamestate = new Array(86).fill(0);
    gamestate[81] = playerId;
    gamestate[82] = 0;      //player points
    gamestate[83] = opponentId;
    gamestate[84] = 0;      //opponent points
    gamestate[85] = 0;      //
    currentPlayer = BLACK;
    playerColor = BLACK;    //TODO determine color
    opponentColor = WHITE;
}

function putStone(pos) {
    //put stone into play
    if(pos >= 0 && pos < 81) {
        gamestate[pos] = playerColor;
    }

    //capture stones
    if(pos > 8) {   //up
        if(gamestate[pos - 9] == opponentColor) {
            captureStones(pos - 9);
        }
    }
    if(pos < 72) {  //down
        if(gamestate[pos + 9] == opponentColor) {
            captureStones(pos + 9);
        }
    }
    if(pos % 9 > 0) {   //left
        if(gamestate[pos - 1] == opponentColor) {
            captureStones(pos - 1);
        }
    }
    if(pos % 9 < 8) {   //right
        if(gamestate[pos + 1] == opponentColor) {
            captureStones(pos + 1);
        }
    }
}

function captureStones(pos) {
    visited = new Array(81).fill(0);
    liberties = getLiberties(pos, visited);
    if(liberties == 0) {
        color = gamestate[pos];
        visited = new Array(81).fill(0);
        removeStone(pos, visited, color);
    }
}

function removeStone(pos, visited, color) {
    visited[pos] = 1;
    if(gamestate[pos] != color) {
        return 0;
    }

    gamestate[82] = gamestate[82] + 1;  //increase player score
    if(pos > 8 && visited[pos - 8] == 0) {   //up
        removeStone(pos - 8, visited, color);
    }
    if(pos < 72 && visited[pos + 8] == 0) {   //down
        removeStone(pos + 8, visited, color);
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        removeStone(pos - 1, visited, color);
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        removeStone(pos + 1, visited, color);
    }
}

function getLiberties(pos, visited) {
    liberties;
    if(pos > 8 && visited[pos - 8] == 0) {   //up
        if(gamestate[pos - 8] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos - 8] = 1;
        } else if(gamestate[pos - 8] == gamestate[pos]) {   //neighbor has same color
            visited[pos - 8] = 1;
            liberties = getLiberties(pos - 8, visited);
        }
    }
    if(pos < 72 && visited[pos + 8] == 0) {   //down
        if(gamestate[pos + 8] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos + 8] = 1;
        } else if(gamestate[pos + 8] == gamestate[pos]) {   //neighbor has same color
            visited[pos + 8] = 1;
            liberties = getLiberties(pos + 8, visited);
        }
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        if(gamestate[pos - 1] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos - 1] = 1;
        } else if(gamestate[pos - 1] == gamestate[pos]) {   //neighbor has same color
            visited[pos - 1] = 1;
            liberties = getLiberties(pos - 1, visited);
        }
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        if(gamestate[pos + 1] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos + 1] = 1;
        } else if(gamestate[pos + 1] == gamestate[pos]) {   //neighbor has same color
            visited[pos + 1] = 1;
            liberties = getLiberties(pos + 1, visited);
        }
    }
    return liberties;
}

// eof
