const colyseus = require("colyseus");
const { config } = require("../config");
const State = require("../stateHandler/gameState");

exports.room = class extends colyseus.Room {
    maxClients = config.maxPlayers;

    onCreate(options) {
        this.setState(new State());
        const roomMetadata = {
            alias: options.roomAlias.trim().substring(0,25),
            adminPlayer: options.player.id
        };
        this.setMetadata(roomMetadata);
        this.setSimulationInterval((deltaTime) => this.update(deltaTime));
    }

    update(deltaTime) {
        this.state.eachTimeFrame(this.clock.elapsedTime, this);
    }

    onJoin(client, options) {
        this.state.createPlayer(
            client.sessionId,
            options.player.uuid,
            options.player.name
        );
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

    }
};
