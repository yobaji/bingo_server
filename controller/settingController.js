const settingsModel = require("../model/settings");

exports.getUpdateTriggerValue = function(res){
    settingsModel.getSetting('updateTriggerValue',function(value){
        res.send({value});
    })
}