var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');

module.exports.newDataSource = function(req, res) {

  // if(!req.body.name || !req.body.email || !req.body.password) {
  //   sendJSONresponse(res, 400, {
  //     "message": "All fields required"
  //   });
  //   return;
  // }
  console.log(req.body);
  console.log("adding new Data Source: ");
  var datasource = new DataSources(req.body);

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
