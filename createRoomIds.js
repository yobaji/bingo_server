var mongoose = require('mongoose');
const { config } = require("./config");
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

var roomAliases = mongoose.model('roomAliases', roomIdsSchema);

roomAliases.deleteMany({},function(){
    initInsert(1);
});

function initInsert(alias){
    add(alias,function(){
        if(alias<10000){
            initInsert(alias+1);
        }
    });
}

function add(alias,callback){
    var roomAlias = new roomAliases({
        roomIdAlias:alias
    });
    //Saving the model instance to the DB
    roomAlias.save(function(err, result){
        if ( err ) throw err;
        console.log("Added "+alias);
        callback();
    });
}