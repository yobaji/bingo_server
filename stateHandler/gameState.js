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
    get clientIDS() {
        return Object.keys(this.players);
    }
    get playerUUIDS() {
        return Object.keys(this.players).map((playerId) => {
            return this.players[playerId].playerUuid;
        });
    }
    get onlinePlayersCount() {
        return Object.keys(this.players).filter((clientId) => {
            return this.players[clientId].isOnline
        }).length;
    }
    get allStrikedCells() {
        let allStrikedCells = [];
        for (var clientId in this.players) {
            allStrikedCells = allStrikedCells.concat(
                this.players[clientId].strikedCells
            );
        }
        return allStrikedCells;
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
    findNewAdmin() {
        for (let clientId in this.players) {
            if (!this.players[clientId].isOnline) continue;
            return clientId;
        }
        return null;
    }
    findNextPlayer(currentPlayer) {
        let nextClientIdIndex = this.clientIDS.indexOf(currentPlayer) + 1;
        let nextClientId = this.clientIDS[nextClientIdIndex];
        if (!nextClientId) {
            nextClientId = this.clientIDS[0];
        }
        return nextClientId;
    }
    createPlayer(clientId, playerUuid, playerName) {
        // if player already exists continue the play
        if (this.clientIDS.indexOf(clientId) >= 0) {
            return;
        }
        if (playerName.trim() == '') {
            playerName = 'Mr No Name'
        }
        this.players[clientId] = new Player();
        this.players[clientId].playerUuid = playerUuid;
        this.players[clientId].playerName = playerName;
        if (!this.currentPlayer) {
            this.currentPlayer = clientId;
            this.adminPlayer = clientId;
        }
        this.gameStarted = false;
    }
    playMyTurn(number, room) {
        room.clock.start();
        if (this.allStrikedCells.indexOf(number) >= 0) return;
        const currentPlayer = this.currentPlayer;
        this.players[currentPlayer].strikedCells.push(number);
        this.currentPlayer = this.findNextPlayer(this.currentPlayer);
        this.runGameLogic(room);
    }
    handleMessage(clientObject, message, room) {
        const clientId = clientObject.sessionId;
        if (!this.players[clientId]) return;
        switch (message.type) {
            case "PLAY_MY_TURN":
                const currentPlayer = this.currentPlayer;
                if (currentPlayer == clientId) {
                    this.playMyTurn(message.number, room);
                }
                break;
            case "START_GAME":
                if (clientId == this.adminPlayer && this.onlinePlayersCount > 1) {
                    room.clock.start();
                    this.restartGame(room);
                    this.gameStarted = true;
                    room.lock();
                }
                break;
            case "PLAYER_SHUFFLE_CELLS":
                if (!this.gameStarted) {
                    this.players[clientId].shuffleCells();
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
        for (let clientId in this.players) {
            if (!this.players[clientId].isOnline) {
                this.removePlayer(clientId, room);
            }
            else {
                this.players[clientId].resetPlayer();
            }
        }
    }
    chooseRandomCurrentPlayer() {
        return this.clientIDS[Math.floor(Math.random() * this.clientIDS.length)]
    }
    runGameLogic(room) {
        const GLogic = new GameLogic(this);
        const playerLogics = GLogic.players;
        let isGameCompleted = false;
        for (let clientId in playerLogics) {
            this.players[clientId].isWon = playerLogics[clientId].isWon;
            if (this.players[clientId].isWon && this.gameStarted) {
                this.players[clientId].winCount++;
                isGameCompleted = true;
            }
        }
        if (isGameCompleted) {
            this.gameStarted = false;
        }
    }
    playerOffline(clientId, room) {
        if (clientId == this.currentPlayer) {
            room.clock.start();
        }
        if (!this.players[clientId]) return;
        this.players[clientId].isOnline = false;
        if (
            clientId == this.adminPlayer &&
            this.clientIDS.length && this.onlinePlayersCount
        ) {
            this.adminPlayer = this.findNewAdmin();
        }
        if (!this.onlinePlayersCount) {
            this.delayed = room.clock.setTimeout(() => {
                room.disconnect();
            }, config.adminRejoinBeforeRoomClose * 1000);
        }
    }
    playerOnline(clientId, room) {
        this.delayed.clear();
        this.players[clientId].isOnline = true;
    }
    removePlayer(clientId, room, clientObject) {
        if (clientObject) {
            clientObject.close();
        }
        if (room.locked) {
            this.players[clientId].isOnline = false;
            return;
        }
        delete this.players[clientId];
        if (clientId == this.currentPlayer && this.clientIDS.length) {
            this.currentPlayer = this.findNextPlayer(this.currentPlayer);
        }
        if (
            clientId == this.adminPlayer &&
            this.clientIDS.length
        ) {
            this.adminPlayer = this.findNewAdmin();
        }
        if (this.clientIDS.length == 1) {
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