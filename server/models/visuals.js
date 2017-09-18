var mongoose = require('mongoose');

/*

  Not used atm

  Visuals are:
   the output of
   a script
   run with a datasource
   with specific params
   by a specific user

   may have a model

   a visual can also be hosted visual on 23degree.

 */

var visualSchema = mongoose.Schema({
  params: [],
  model: [],
  script: {}
},
{
    timestamps: true
}
);
var Visuals = mongoose.model('Visuals', visualSchema);
module.exports = Visuals;

