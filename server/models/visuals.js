var mongoose = require('mongoose');

var visualSchema = mongoose.Schema({
  datasource_id : String,
  username: String,
  params: {}
});

var Visuals = mongoose.model('Visuals', visualSchema);
module.exports = Visuals;

