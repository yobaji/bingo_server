const PlayerLogic = require('./playerLogic')
class GameLogic {
    constructor(state) {
        this.state = state;
        this.PLogic = new PlayerLogic();
        this.players = {};
        this.players = this.createPlayerLogics();
    }
    get getAllStrikedCells() {
        let allStrikedCells = [];
        for (let playerId in this.state.players) {
            allStrikedCells = allStrikedCells.concat(
                this.state.players[playerId].strikedCells
            );
        }
        return allStrikedCells;
    }
    createPlayerLogics() {
        let players = {};
        let allStrikedCells = this.getAllStrikedCells;
        for (let playerId in this.state.players) {
            players[playerId] = new PlayerLogic(this.state.players[playerId], allStrikedCells);
        }
        return players;
    }
}

module.exports = GameLogic;