// tremola_go.js

"use strict";

const BLACK = 1;
const WHITE = 2;

let gamestate;          //0-80: field, 81: playerId, 82: playerPoints, 83: opponentId, 84: opponentPoints, 85: turn, 86: pass counter
let currentPlayer;
let playerColor;
let opponentColor;


function startTremolaGo(playerId, opponentId) {
    gamestate = new Array(87).fill(0);
    gamestate[81] = playerId;
    gamestate[82] = 0;      //player points
    gamestate[83] = opponentId;
    gamestate[84] = 0;      //opponent points
    gamestate[85] = 0;      //turn counter
    gamestate[86] = 0;      //pass counter
    currentPlayer = BLACK;
    playerColor = BLACK;    //TODO determine color
    opponentColor = WHITE;
}

function loadTremolaGo(nextGameState) {
    gamestate = nextGameState;
    //TODO: ui
}

function putStone(pos) {
    if(pos == 0) {
        gamestate[86] = gamestate[86] + 1;      //pass the turn
        return;
    }
    //put stone into play
    if(pos >= 0 && pos < 81) {
        gamestate[pos] = playerColor;
        gamestate[86] = 0;
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

    gamestate[pos] = 0;
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

function isPlayersTurn(myId) {
    if(gamestate[85] % 2 == 0 && gamestate[81] == myId) {
        return true;
    } else {
        return false;
    }
}

function isGameOver() {
    //if both players passed their turn consecutively, the game is over
    return (gamestate[86] >= 2);
}

function getWinner() {
    if(gamestate[82] > gamestate[84]) {
        return gamestate[81];
    } else if(gamestate[84] > gamestate[82]) {
        return gamestate[83];
    } else {
        return -1;      //draw
    }
}

// eof
