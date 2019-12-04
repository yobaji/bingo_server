var mongoose = require('mongoose');
const { config } = require("../config");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.mongoDbUri);

var roomSchema = mongoose.Schema({
  name: String,
  roomId: String,
  players: Array,
  noOfGames: {type:Number, default: 0},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now},
  disposedAt: {type: Date, default: null}
});

var Room = mongoose.model('room', roomSchema);

mongoose.connection;

module.exports.addNewroom = function(body){
  var room = new Room({
    name:body.name,
    roomId: body.roomId,
    players: body.players
  });

  //Saving the model instance to the DB
  room.save(function(err, result){
    if ( err ) throw err;
  });
}

module.exports.addNewroom = function(body){
  var room = new Room({
    name:body.name,
    roomId: body.roomId,
    players: body.players
  });

  //Saving the model instance to the DB
  room.save(function(err, result){
    if ( err ) throw err;
  });
}

module.exports.addPlayer = function(player, roomId){
  Room.findOne({roomId: roomId}, function(err, result){
    if ( err ) throw err;

    if(!result){
      return;
    }
    result.players.push(player);
    result.updatedAt = Date.now();
    
    result.save(function(err, result){
      if ( err ) throw err;
    });

  });
}

module.exports.incrementNoOfGames = function(roomId){
  Room.findOne({roomId: roomId}, function(err, result){
    if ( err ) throw err;

    if(!result){
      return;
    }
    result.noOfGames++;
    result.updatedAt = Date.now();
    
    result.save(function(err, result){
      if ( err ) throw err;
    });

  });
}

module.exports.addDisposeTime = function(roomId){
  Room.findOne({roomId: roomId}, function(err, result){
    if ( err ) throw err;
    if(!result){
      return;
    }
    result.disposedAt = Date.now();    
    result.save(function(err, result){
      if ( err ) throw err;
    });

  });
}