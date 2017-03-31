var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');

module.exports.newDataSource = function(req, res) {
  console.log(req.body);
  console.log("adding new Data Source: ");
  var datasource = new DataSources(req.body);
  //search for a user and if it doenst exist. add it

  //talk to bot here


  datasource.save(function(err,newdatasource) {
    if(err)
    {

    }
    else
    {
      res.status(200).json(newdatasource);
    }
  });

};
