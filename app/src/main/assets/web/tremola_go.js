// tremola_go.js

"use strict";

const BLACK = "B";
const WHITE = "W";

let gamestate;          //0-80: field, 81: playerId, 82: playerPoints, 83: opponentId, 84: opponentPoints, 85; turn
let currentPlayer;


function startTremolaGo(playerId, opponentId) {
    gamestate = new Array(86).fill(0);
    gamestate[81] = playerId;
    gamestate[82] = 0;      //player points
    gamestate[83] = opponentId;
    gamestate[84] = 0       //opponent points
    gamestate[85] = 0
    currentPlayer = BLACK;
}

// eof
