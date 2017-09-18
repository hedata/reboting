var mongoose = require('mongoose');

var usersSchema = mongoose.Schema({
    user_id : String,
    current_slug : String,
    current_data_id : String
  },
  {
    timestamps: true
  }
);
var Users = mongoose.model('Users', usersSchema);
module.exports = Users;
