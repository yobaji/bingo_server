var mongoose = require('mongoose');
const { config } = require("../config");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.mongoDbUri);

var roomIdsSchema = mongoose.Schema({
    roomId: {type:String, default: ''},
    roomIdAlias: Number,
    used: {type:Boolean, default: false},
    lastUsed :{type: Date, default: new Date()}
});

var RoomAliases = mongoose.model('roomAliases', roomIdsSchema);

module.exports.createRoomAlias = function(roomId){
  RoomAliases.findOne({used: false}, {}, { sort: { 'roomIdAlias' : 1 } }, function(err, result){
    if ( err ) throw err;
    if(!result){
      return;
    }
    result.roomId = roomId;
    result.used = true;
    result.lastUsed = new Date();
    result.save(function(err, result){
      if ( err ) throw err;
    });

  });
}

module.exports.getRoomAlias = function(roomId,callback){
  RoomAliases.findOne({roomId: roomId}, function(err, result){
    if ( err || !result){
      callback(false);
      return;
    }
    callback(result.roomIdAlias);
  });
}

module.exports.getRoomIdFromAlias = function(roomAlias,callback){
  RoomAliases.findOne({roomIdAlias: roomAlias}, function(err, result){
    if ( err || !result){
      callback(false);
      return;
    }
    callback(result.roomId);
  });
}

module.exports.markNotUsed = function(roomId){
  RoomAliases.findOne({roomId: roomId}, function(err, result){
    if ( err ) throw err;
    if(!result){
      return;
    }
    result.roomId = '';
    result.used = false;
    result.save(function(err, result){
      if ( err ) throw err;
    });

  });
}

module.exports.clearRoomAliases = function(){ 
  RoomAliases.updateMany({used:true},{ $set: { 
    roomId: '',
    used:false
  }},{multi: true},()=>{});
}