/**
 * Created by hedata on 21.04.17.
 */

var mongoose = require('mongoose');

var scriptsSchema = mongoose.Schema({
  code: String,
  action_name: { type: String, index: { unique: true }}
});

var Scripts = mongoose.model('Scripts', scriptsSchema);
module.exports = Scripts;
