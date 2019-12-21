const roomAliasModel = require("../model/roomAliases");
exports.getRoomAlias = function(req,res){
    if(!req.query.roomId){
        res.json({});
        return;
    }
    roomAliasModel.getRoomAlias(req.query.roomId,function(roomIdAlias){
        if(roomIdAlias){
            res.json({
                roomIdAlias
            });
        }else{
            res.send({
                roomIdAlias:req.query.roomId
            });
        }
    });
}
exports.getRoomIdFromAlias = function(req,res){
    if(!req.query.roomAlias){
        res.json({});
        return;
    }
    roomAliasModel.getRoomIdFromAlias(req.query.roomAlias,function(roomId){
        if(roomId){
            res.json({
                roomId
            });
        }else{
            res.send({
                roomId:req.query.roomAlias
            });
        }
    });
}

exports.clearRoomAliases = function(){
    roomAliasModel.clearRoomAliases();
}