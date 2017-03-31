
var mongoose = require('mongoose');

var dataSourceSchema = mongoose.Schema({
  datasource: {}
});

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
