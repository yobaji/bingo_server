const schema = require("@colyseus/schema");
var GameLogic = require("../gameLogic");
const roomModel = require("../model/room");
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
    findClientIdFromUuid(uuid){
        if(this.playerUUIDS.indexOf(uuid)>=0){
            return(this.clientIDS[this.playerUUIDS.indexOf(uuid)]);
        }
        return false;
    }
    eachTimeFrame(elapsedTime, room) {
        const elapsedTimeInSec = parseInt(elapsedTime / 1000);
        if (!this.gameStarted) return;
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
    createPlayer(clientId, playerUuid, playerName, room) {
        // if player already exists continue the play
        if (this.clientIDS.indexOf(clientId) >= 0) {
            return;
        }
        // if uuid already exist kick that player out
        var uuidFoundClientId = this.findClientIdFromUuid(playerUuid);
        if(uuidFoundClientId){
            let clientToRemove = this.getClientObjectFromId(uuidFoundClientId,room);
            clientToRemove.close();
        }
        if (!playerName || playerName.trim() == '') {
            playerName = 'Mr No Name'
        }else{
            playerName = playerName.trim().substring(0,20);
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
    getClientObjectFromId(clientId,room){
        for(let index in room.clients){
            let client = room.clients[index];
            if(client.id == clientId){
                return client;
            }
        }
        return false;
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
                    roomModel.incrementNoOfGames(room.roomId);
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
                    room.unlock();
                    this.restartGame(room,false);
                }
                break;
            case "REMOVE_PLAYER":
                this.removePlayer(message.playerId, room, clientObject);
                break;
            case "KICKOUT_PLAYER":
                let client = this.getClientObjectFromId(message.playerId,room);
                if(client){
                    if(room.locked){
                        client.close();
                    }else{
                        this.removePlayer(client.id,room,client);
                    }
                }
                break;
            case "POP_EMOJI":
                room.broadcast({ type: "POP_EMOJI", emojiName: message.emojiName, playerId: clientId }, { except: clientObject });
                break;
            default:
                break;
        }
    }
    restartGame(room,shuffle=true) {
        for (let clientId in this.players) {
            if (!this.players[clientId].isOnline) {
                this.removePlayer(clientId, room,false,true);
            }
            else {
                this.players[clientId].resetPlayer(shuffle);
            }
        }
        this.currentPlayer = this.chooseRandomCurrentPlayer();
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
        if (!this.players[clientId]) return;
        this.players[clientId].isOnline = true;
    }
    setRoomName(roomName){
        this.roomName = roomName;
    }
    removePlayer(clientId, room, clientObject,forceRemove=false) {
        if (clientObject) {
            clientObject.close();
        }
        if (room.locked && !forceRemove) {
            if(this.players[clientId]){
                this.players[clientId].isOnline = false;
            }
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
    roomName: "string",
    adminPlayer: "string",
    currentPlayer: "string",
    gameStarted: "boolean",
    playerTimeout: "number",
    offlinePlayerTimeout: "number",
    elapsedTime: "number"
});

module.exports = State;