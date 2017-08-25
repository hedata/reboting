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
  data_id : String,
  user_id: String,
  //params used to create the visual on 23degree
  visual_param: {},
  //metadata of the data for this specific visual
  metadata: {},
  //slug as unique url identifier for 23degree
  slug: String,
  //type is if it is self | 23dg -> visual hosted on 23degree
  type: String,
  // script model and params are for python visuals i create
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

