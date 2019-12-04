const colyseus = require("colyseus");
const { config } = require("../config");

exports.room = class extends colyseus.Room {
    async onAuth(client, options,request) {
        return request;
    }
    onCreate(options) { }

    onJoin(client, options,request) {

    }

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
