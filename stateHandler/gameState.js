const schema = require("@colyseus/schema");
var GameLogic = require("../gameLogic");
const { helper } = require("../helpers");
const { config } = require("../config");
const Schema = schema.Schema;
const { ArraySchema, MapSchema } = schema;

const Player = require("./playerState");

class State extends Schema {

    constructor() {
        super();
        this.players = new MapSchema();
        this.playerTimeout = config.playerTimeout;
        this.offlinePlayerTimeout = config.offlinePlayerTimeout;
        this.elapsedTime = 0;

        // initialize a dummy delayed Instance
        this.delayed = { clear: () => { } }
    }
    get playerIDS() {
        return Object.keys(this.players);
    }
    get onlinePlayersCount() {
        return Object.keys(this.players).filter((playerId) => {
            return this.players[playerId].isOnline
        }).length;
    }
    eachTimeFrame(elapsedTime, room) {
        const elapsedTimeInSec = parseInt(elapsedTime / 1000);

        // no need to update state
        if (elapsedTimeInSec == this.elapsedTime) return;
        if (!this.gameStarted) return;
        this.elapsedTime = elapsedTimeInSec;
        var isPlayerOnline = this.players[this.currentPlayer].isOnline;
        if (isPlayerOnline && elapsedTimeInSec >= this.playerTimeout) {
            room.clock.start();
            this.playMyTurn(this.findNextRandomNumber(room), room);
        }
        if (isPlayerOnline) return;
        if (elapsedTimeInSec >= this.offlinePlayerTimeout) {
            room.clock.start();
            this.playMyTurn(this.findNextRandomNumber(room), room);
        }
    }
    findNextRandomNumber(room) {
        const allStrikedCells = (new GameLogic(this)).getAllStrikedCells;
        return helper.array.findRandomFromNonStriked(allStrikedCells);
    }
    findPlayerId(clientId) {
        for (let playerId in this.players) {
            if (this.players[playerId].playerClientId == clientId) {
                return playerId;
            }
        }
    }
    findNewAdmin() {
        for (let playerId in this.players) {
            if (!this.players[playerId].isOnline) continue;
            return playerId;
        }
        return null;
    }
    findNextPlayer(currentPlayer) {
        let nextPlayerIdIndex = this.playerIDS.indexOf(currentPlayer) + 1;
        let nextPlayerId = this.playerIDS[nextPlayerIdIndex];
        if (!nextPlayerId) {
            nextPlayerId = this.playerIDS[0];
        }
        return nextPlayerId;
    }
    createPlayer(clientId, playerId, playerName) {
        // if player already exists continue the play
        if (this.playerIDS.indexOf(playerId) >= 0) {
            return;
        }
        if (playerName.trim() == '') {
            playerName = 'Mr No Name'
        }
        this.players[playerId] = new Player();
        this.players[playerId].playerClientId = clientId;
        this.players[playerId].playerName = playerName;
        if (!this.currentPlayer) {
            this.currentPlayer = playerId;
            this.adminPlayer = playerId;
        }
        this.gameStarted = false;
    }
    playMyTurn(number, room) {
        room.clock.start();
        if (this.allStrikedCells().indexOf(number) >= 0) return;
        const currentPlayer = this.currentPlayer;
        this.players[currentPlayer].strikedCells.push(number);
        this.currentPlayer = this.findNextPlayer(this.currentPlayer);
        this.runGameLogic(room);
    }
    handleMessage(clientObject, message, room) {
        const clientId = clientObject.sessionId;
        const playerId = this.findPlayerId(clientId);
        if (!this.players[playerId]) return;
        switch (message.type) {
            case "PLAY_MY_TURN":
                const currentPlayer = this.currentPlayer;
                if (currentPlayer == playerId) {
                    this.playMyTurn(message.number, room);
                }
                break;
            case "START_GAME":
                if (playerId == this.adminPlayer && this.onlinePlayersCount > 1) {
                    room.clock.start();
                    this.restartGame(room);
                    this.gameStarted = true;
                    room.lock();
                }
                break;
            case "PLAYER_SHUFFLE_CELLS":
                if (!this.gameStarted) {
                    this.players[playerId].shuffleCells();
                }
                break;
            case "RE_OPEN_ROOM":
                if (!this.gameStarted) {
                    this.restartGame(room);
                    room.unlock();
                }
                break;
            case "REMOVE_PLAYER":
                this.removePlayer(clientId, room, clientObject);
                break;
            default:
                break;
        }
    }
    restartGame(room) {
        this.currentPlayer = this.chooseRandomCurrentPlayer();
        for (let playerId in this.players) {
            if (!this.players[playerId].isOnline) {
                this.removePlayer(this.players[playerId].playerClientId, room);
            }
            else {
                this.players[playerId].resetPlayer();
            }
        }
    }
    chooseRandomCurrentPlayer() {
        return this.playerIDS[Math.floor(Math.random() * this.playerIDS.length)]
    }
    runGameLogic(room) {
        const GLogic = new GameLogic(this);
        const playerLogics = GLogic.players;
        let isGameCompleted = false;
        for (let playerId in playerLogics) {
            this.players[playerId].isWon = playerLogics[playerId].isWon;
            if (this.players[playerId].isWon && this.gameStarted) {
                this.players[playerId].winCount++;
                isGameCompleted = true;
            }
        }
        if (isGameCompleted) {
            this.gameStarted = false;
        }
    }
    allStrikedCells() {
        let allStrikedCells = [];
        for (var playerId in this.players) {
            allStrikedCells = allStrikedCells.concat(
                this.players[playerId].strikedCells
            );
        }
        return allStrikedCells;
    }
    playerOffline(clientId, room) {
        const playerId = this.findPlayerId(clientId);
        if (playerId == this.currentPlayer) {
            room.clock.start();
        }
        if (!this.players[playerId]) return;
        this.players[playerId].isOnline = false;
        if (
            playerId == this.adminPlayer &&
            this.playerIDS.length && this.onlinePlayersCount
        ) {
            this.adminPlayer = this.findNewAdmin();
        }
        if (!this.onlinePlayersCount) {
            room.lock();
            this.delayed = room.clock.setTimeout(() => {
                room.disconnect();
            }, config.adminRejoinBeforeRoomClose * 1000);
        }
    }
    playerOnline(clientId, room) {
        this.delayed.clear();
        if (!this.gameStarted) {
            room.unlock();
        }
        const playerId = this.findPlayerId(clientId);
        this.players[playerId].isOnline = true;
    }
    removePlayer(clientId, room, clientObject) {
        if (clientObject) {
            clientObject.close();
        }
        const playerId = this.findPlayerId(clientId);
        if (this.gameStarted) {
            this.players[playerId].isOnline = false;
            return;
        }
        delete this.players[playerId];
        if (playerId == this.currentPlayer && this.playerIDS.length) {
            this.currentPlayer = this.findNextPlayer(this.currentPlayer);
        }
        if (
            playerId == this.adminPlayer &&
            this.playerIDS.length
        ) {
            this.adminPlayer = this.findNewAdmin();
        }
        if (this.playerIDS.length == 1) {
            this.gameStarted = false;
            var emptyArray = new ArraySchema();
            this.players[this.currentPlayer].strikedCells = emptyArray;
        }
        if (!this.onlinePlayersCount) {
            room.lock();
        }
    }
}
schema.defineTypes(State, {
    players: { map: Player },
    adminPlayer: "string",
    currentPlayer: "string",
    gameStarted: "boolean",
    playerTimeout: "number",
    offlinePlayerTimeout: "number",
    elapsedTime: "number"
});

module.exports = State;