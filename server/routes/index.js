var express = require('express');
var router = express.Router();

var ctrlActions = require('./actions');

console.log("adding route datasources");
router.post('/actions',ctrlActions.takeAction);

module.exports = router;
