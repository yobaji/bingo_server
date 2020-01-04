var mongoose = require('mongoose');
const { config } = require("../config");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(config.mongoDbUri);

var settingSchema = mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
});

var Setting = mongoose.model('settings', settingSchema);

module.exports.getSetting = function(key,callback){
    Setting.findOne({key}, function(err, result){
      if ( err || !result){
        callback(false);
        return;
      }
      callback(result.value);
    });
  }