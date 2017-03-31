
var mongoose = require('mongoose');

var visualSchema = mongoose.Schema({
  data_source_id : String,
  params: {}
});

var Visuals = mongoose.model('Visuals', visualSchema);
module.exports = Visuals;
