const colyseus = require("colyseus");
const { config } = require("../config");
const State = require("../stateHandler/gameState");

exports.room = class extends colyseus.Room {
    maxClients = config.maxPlayers;

    onCreate(options) {
        this.setState(new State());
        const roomMetadata = {
            alias: options.roomAlias,
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
            options.player.id,
            options.player.name
        );
    }

    onMessage(client, message) {
        this.state.handleMessage(client, message, this);
    }

    async onLeave(client, consented) {
        this.state.playerOffline(client.sessionId, this);
        try {
            if (consented) {
                throw new Error("consented leave");
            }

            // allow disconnected client to reconnect into this room until 20 seconds
            await this.allowReconnection(client, 20);

            // client returned! let's re-activate it.
            this.state.playerOnline(client.sessionId, this);

        } catch (e) {
            client.close();
        }
    }

    onDispose() {

    }
};
