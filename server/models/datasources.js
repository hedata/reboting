
var mongoose = require('mongoose');

var dataSourceSchema = mongoose.Schema({
  userName: String,
  fileName: String,
  type: String,
  profiler : {}
});

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
