const colyseus = require("colyseus");
const { config } = require("../config");
const State = require("../stateHandler/gameState");
const roomModel = require("../model/room");

exports.room = class extends colyseus.Room {
    maxClients = config.maxPlayers;

    async onAuth (client, options,request) {
        return request;
    }

    onCreate(options) {
        const roomAlias = options.roomAlias.trim().substring(0,25);
        roomModel.addNewroom({
            roomId:this.roomId,
            name:roomAlias,
            players:[]
        });
        this.setState(new State());
        const roomMetadata = {
            alias: roomAlias
        };
        this.setMetadata(roomMetadata);
        this.state.setRoomName(roomAlias);
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
    }

    update(deltaTime) {
        this.state.eachTimeFrame(this.clock.elapsedTime, this);
    }

    onJoin(client, options, request) {
        const IP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
        this.state.createPlayer(
            client.sessionId,
            options.player.uuid,
            options.player.name
        );
        roomModel.addPlayer({
            clientId:client.sessionId,
            uuid:options.player.uuid,
            name:options.player.name,
            ip:IP
        },this.roomId);
    }

    onMessage(client, message) {
        this.state.handleMessage(client, message, this);
    }

    async onLeave(client, consented) {
        if(!this.state.players[client.sessionId])return;
        this.state.playerOffline(client.sessionId, this);
        let rejoinTimeout = this.locked ? 20 : 0;
        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, rejoinTimeout);

            // client returned! let's re-activate it.
            this.state.playerOnline(client.sessionId, this);

        } catch (e) {
            this.state.removePlayer(client.sessionId, this);
            client.close();
        }
    }

    onDispose() {
        roomModel.addDisposeTime(this.roomId);
    }
};
