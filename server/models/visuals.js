var mongoose = require('mongoose');
var visualSchema = mongoose.Schema({
  datasource_id : String,
  user_id: String,
  params: [],
  model: [],
  script: {}
});

/*
  Visuals are:
   the output of
   a script
   run with a datasource
   with specific params
   by a specific user

   may have a model

 */


var Visuals = mongoose.model('Visuals', visualSchema);
module.exports = Visuals;

