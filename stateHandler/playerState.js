const schema = require("@colyseus/schema");
const { helper } = require("../helpers");
const Schema = schema.Schema;
const { ArraySchema } = schema;
const Cell = require("./cellState");

class Player extends Schema {
    constructor() {
        super();
        this.resetPlayer();
        this.winCount = 0;
        this.isOnline = true;
    }
    resetPlayer(shuffle = true) {
        this.shuffleCells(shuffle);
        this.isWon = false;
    }
    shuffleCells(shuffle) {
        this.strikedCells = new ArraySchema();
        if(!shuffle)return;
        this.cellArray = new ArraySchema();
        helper.array.createCells().forEach(C => {
            this.cellArray[C.position - 1] = new Cell();
            this.cellArray[C.position - 1].position = C.position;
            this.cellArray[C.position - 1].number = C.number;
        });
    }
}
schema.defineTypes(Player, {
    playerUuid: "string",
    cellArray: [Cell],
    strikedCells: ["number"],
    playerName: "string",
    isWon: "boolean",
    isOnline: "boolean",
    winCount: "number"
});
module.exports = Player;