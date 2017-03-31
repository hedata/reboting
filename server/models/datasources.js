
var mongoose = require('mongoose');

var dataSourceSchema = mongoose.Schema({
  userName: String,
  fileName: String,
  lastModified: String,
  lastModifiedDate: Date,
  size: Number,
  type: String,
  data: []
});

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
