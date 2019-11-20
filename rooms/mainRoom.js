const colyseus = require("colyseus");
const { config } = require("../config");

exports.room = class extends colyseus.Room {

    onCreate(options) { }

    onJoin(client, options) { }

    onMessage(client, message) {
        if (message === "ROOM_UPDATE") {
            this.broadcast("ROOM_UPDATE");
        }
    }

    onLeave(client, consented) {
        this.broadcast("ROOM_UPDATE");
    }

    onDispose() {
        this.broadcast("ROOM_UPDATE");
    }
};
