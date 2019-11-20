const schema = require("@colyseus/schema");
const Schema = schema.Schema;

class Cell extends Schema { }
schema.defineTypes(Cell, {
    position: "number",
    number: "number",
    playerClientId: "string"
});

module.exports = Cell;