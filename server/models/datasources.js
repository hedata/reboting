
var mongoose = require('mongoose');

var dataSourceSchema = mongoose.Schema({
  user_id: String,
  url: String,

},
{
  timestamps: true
}
);

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
