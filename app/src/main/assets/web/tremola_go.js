// tremola_go.js

"use strict";

const BLACK = 1;
const WHITE = 2;

let gamestate;          //0-80: field, 81: blackId, 82: blackPoints, 83: whiteId, 84: whitePoints, 85: turn, 86: pass counter
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
    playerColor = BLACK;    //player who initiates always is black
    opponentColor = WHITE;

    return gamestate;
}

function loadTremolaGo(nextGameState) {
    gamestate = nextGameState;
    updateUI();
}

function sendGameState() {
    if(isGameOver()) {
        adjustScore();
    }
    post_new_gamestate("tremola_go", gamestate);

    if(isGameOver()) {
        launch_snackbar("score," + gamestate[82] + ":" + gamestate[84]);
        if (getWinner() == myId) {
            document.getElementById('winner-overlay').style.display = 'initial';
            document.getElementById('overlay-bg').style.display = 'initial';
            overlayIsActive = true;
        } else if (getWinner() == -1) {
            document.getElementById('tie-overlay').style.display = 'initial';
            document.getElementById('overlay-bg').style.display = 'initial';
            overlayIsActive = true;
        } else {
            document.getElementById('loser-overlay').style.display = 'initial';
            document.getElementById('overlay-bg').style.display = 'initial';
            overlayIsActive = true;
        }

        remove_gamestate("tremola_go");
    }
}

function putStone(pos) {
    gamestate[85] = gamestate[85] + 1;
    if(pos == -1) {
        //pass the turn
        gamestate[86] = gamestate[86] + 1;
        sendGameState();
        return;
    }
    //put stone into play
    if(pos >= 0 && pos < 81) {
        gamestate[pos] = currentPlayer;
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

    //capture own stone(s) if stone was placed in opponent-surrounded area
    captureStones(pos);

    sendGameState();
}

function captureStones(pos) {
    var visited = new Array(81).fill(0);
    var liberties = getLiberties(pos, visited);
    if(liberties == 0) {
        var color = gamestate[pos];
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
    //increase player score
    if(color == BLACK) {    //black stone
        gamestate[84] = gamestate[84] + 1;
    } else {                //white stone
        gamestate[82] = gamestate[82] + 1;
    }

    if(pos > 8 && visited[pos - 9] == 0) {   //up
        removeStone(pos - 9, visited, color);
    }
    if(pos < 72 && visited[pos + 9] == 0) {   //down
        removeStone(pos + 9, visited, color);
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        removeStone(pos - 1, visited, color);
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        removeStone(pos + 1, visited, color);
    }
}

function getLiberties(pos, visited) {
    var liberties = 0;
    visited[pos] = 1;
    if(pos > 8 && visited[pos - 9] == 0) {   //up
        if(gamestate[pos - 9] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos - 9] = 1;
        } else if(gamestate[pos - 9] == gamestate[pos]) {   //neighbor has same color
            visited[pos - 9] = 1;
            liberties = liberties + getLiberties(pos - 9, visited);
        }
    }
    if(pos < 72 && visited[pos + 9] == 0) {   //down
        if(gamestate[pos + 9] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos + 9] = 1;
        } else if(gamestate[pos + 9] == gamestate[pos]) {   //neighbor has same color
            visited[pos + 9] = 1;
            liberties = liberties + getLiberties(pos + 9, visited);
        }
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        if(gamestate[pos - 1] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos - 1] = 1;
        } else if(gamestate[pos - 1] == gamestate[pos]) {   //neighbor has same color
            visited[pos - 1] = 1;
            liberties = liberties + getLiberties(pos - 1, visited);
        }
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        if(gamestate[pos + 1] == 0) {       //neighbor is free
            liberties = liberties + 1;
            visited[pos + 1] = 1;
        } else if(gamestate[pos + 1] == gamestate[pos]) {   //neighbor has same color
            visited[pos + 1] = 1;
            liberties = liberties + getLiberties(pos + 1, visited);
        }
    }
    return liberties;
}

function isSurrounded(pos, visited) {
    visited[pos] = 1;
    var color = 0;
    var other;

    if(pos > 8 && visited[pos - 9] == 0) {   //up
        if(gamestate[pos - 9] != 0) {
            other = gamestate[pos - 9];
        } else {
            other = isSurrounded(pos - 9, visited);
        }
        if(color > 0 && color != other) {
            color = -1;
        } else if(color == 0) {
            color = other;
        }
    }
    if(pos < 72 && visited[pos + 9] == 0) {   //down
        if(gamestate[pos + 9] != 0) {
            other = gamestate[pos + 9];
        } else {
            other = isSurrounded(pos + 9, visited);
        }
        if(color > 0 && color != other) {
            color = -1;
        } else if(color == 0) {
            color = other;
        }
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        if(gamestate[pos - 1] != 0) {
            other = gamestate[pos - 1];
        } else {
            other = isSurrounded(pos - 1, visited);
        }
        if(color > 0 && color != other) {
            color = -1;
        } else if(color == 0) {
            color = other;
        }
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        if(gamestate[pos + 1] != 0) {
            other = gamestate[pos + 1];
        } else {
            other = isSurrounded(pos + 1, visited);
        }
        if(color > 0 && color != other) {
            color = -1;
        } else if(color == 0) {
            color = other;
        }
    }
    return color;
}

function areaSize(pos, visited) {
    visited[pos] = 1;
    var size = 1;

    if(pos > 8 && visited[pos - 9] == 0) {   //up
        if(gamestate[pos - 9] == 0) {       //neighbor is free
            visited[pos - 9] = 1;
            size = size + areaSize(pos - 9, visited);
        }
    }
    if(pos < 72 && visited[pos + 9] == 0) {   //down
        if(gamestate[pos + 9] == 0) {       //neighbor is free
            visited[pos + 9] = 1;
            size = size + areaSize(pos + 9, visited);
        }
    }
    if(pos % 9 > 0 && visited[pos - 1] == 0) {   //left
        if(gamestate[pos - 1] == 0) {       //neighbor is free
            visited[pos - 1] = 1;
            size = size + areaSize(pos - 1, visited);
        }
    }
    if(pos % 9 < 8 && visited[pos + 1] == 0) {   //right
        if(gamestate[pos + 1] == 0) {       //neighbor is free
            visited[pos + 1] = 1;
            size = size + areaSize(pos + 1, visited);
        }
    }
    return size;
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

function adjustScore() {
    var visited = new Array(81).fill(0);
    for(let i = 0; i < 81; i++) {
        if(gamestate[i] == 0 && visited[i] == 0) {
            var color = isSurrounded(i, visited);
            var areaVisited = new Array(81).fill(0);
            if(color == BLACK) {
                gamestate[82] = gamestate[82] + areaSize(i, areaVisited);
            } else if(color == WHITE) {
                gamestate[84] = gamestate[84] + areaSize(i, areaVisited);
            }
        }
    }
}

function makeMove(id) {
    if(id == -1) {  //forfeit
        forfeit();
        launch_snackbar("you forfeit the game");
        return;
    }
    if (!isPlayersTurn(myId)) {
        launch_snackbar("not your turn");
        return;
    }

    if(id == 0) {   //pass turn
        putStone(-1);
        launch_snackbar("you pass the turn");
        updateUI();
        return;
    }

    if (id > 0 && document.getElementById(id).style.backgroundColor != '') {
       launch_snackbar("space already occupied");
       return;
    }

    if (currentPlayer == BLACK) {
        document.getElementById(id).style.backgroundColor = '#000';
        putStone(id-1);
    } else {
        document.getElementById(id).style.backgroundColor = '#FFFFFF';
        putStone(id-1);
    }
    updateUI();
}

function updateUI() {
    for (let i = 1; i <= 81; i++) {
        document.getElementById(i.toString()).style.backgroundColor = getColor(gamestate[i-1]);
    }
    currentPlayer = (gamestate[85] % 2) + 1;
    opponentColor = ((gamestate[85] + 1) % 2) + 1;
}

function getColor(id) {
    if (id == 0) {
        return '';
    } else if (id == BLACK) {
        return '#000';
    } else {
        return '#FFFFFF';
    }
}

function forfeit() {
    //set players points to -100 and pass counter to 2
    //so end condition for game is met and player loses due to points
    if(myId == gamestate[81]) {    //black
        gamestate[82] = -100;
    } else {                        //white
        gamestate[84] = -100;
    }
    gamestate[86] = 2;
    sendGameState();
}

// eof
