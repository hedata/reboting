
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name : String,
  datasource_id : String
});

var Users = mongoose.model('Users', userSchema);
module.exports = Users;
