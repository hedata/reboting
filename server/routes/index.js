var express = require('express');
var router = express.Router();

var ctrlDataSource = require('./datasources');

console.log("adding route datasources");
router.post('/datasource', ctrlDataSource.newDataSource);

module.exports = router;
