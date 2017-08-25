
var mongoose = require('mongoose');

/*
  Saves a datasource with url
    - where did it come from
    - metadata description publisher and co of the search result
    - the unique identifier is the dataid

 */

var dataSourceSchema = mongoose.Schema({
  user_id: String,
  url: String,
  data_id: String,
  timeDimension: String,
  timeField : String,
  isoField : String,
  columnlist: [String],
  numericColumnlist : [String],
  stringColumnlist : [String],
  dataDesc : {},
  visuals : [{}],
},
{
  timestamps: true
}
);

var DataSources = mongoose.model('DataSources', dataSourceSchema);
module.exports = DataSources;
