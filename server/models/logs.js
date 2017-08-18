/**
 * Created by hedata on 31.03.17.
 */
var mongoose = require('mongoose');

var logSchema = mongoose.Schema({
    action : {},
    bot_response: {}
},
  {
    timestamps: true
  }
);

var Logs = mongoose.model('Logs', logSchema);
module.exports = Logs;



