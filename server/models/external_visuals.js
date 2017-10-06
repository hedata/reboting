var mongoose = require('mongoose');

var externalvisualSchema = mongoose.Schema({
   user_id : String,
   data_id : String,
   slug : String,
   visual : {}
  },
  {
    timestamps: true
  }
);
var ExternalVisuals = mongoose.model('ExternalVisuals', externalvisualSchema);
module.exports = ExternalVisuals;
