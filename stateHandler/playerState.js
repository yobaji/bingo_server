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
    resetPlayer() {
        this.shuffleCells();
        this.isWon = false;
    }
    shuffleCells() {
        this.cellArray = new ArraySchema();
        this.strikedCells = new ArraySchema();
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