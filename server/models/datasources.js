
var mongoose = require('mongoose');

var dataSourceSchema = mongoose.Schema({
  user_id: String,
  params: {}
});

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
