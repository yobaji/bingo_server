exports.config = {
    mongoDbUri: 'mongodb://localhost:27017/bingo',
    maxPlayers: 5,
    playerTimeout: 15, // in seconds
    offlinePlayerTimeout: 3, // in seconds
    adminRejoinBeforeRoomClose: 60 // in seconds
};
