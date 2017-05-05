var express = require('express');
var router = express.Router();

var ctrlActions = require('./actions');

console.log("adding route action");
router.post('/actions',ctrlActions.takeAction);

module.exports = router;
