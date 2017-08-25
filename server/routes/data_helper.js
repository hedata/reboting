var apiai = require('apiai');
var app = apiai("ebcf0040b9324ebf84475422b113d202");
var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var Logs = mongoose.model('Logs');
var Scripts = mongoose.model('Scripts');
var Visuals = mongoose.model('Visuals');
var request = require('request');
var async = require('async');


module.exports.queryDataExists = function(context) {
  DataSources.findOne({url: context.checkforknowncsv.url}).exec(function(err,obj){
    if(obj) {
      console.log("sending response");
      context.responseObj = {
        exists: true,
        payload: obj
      };
      returnDataLogResponse(context);
    } else {
      context.responseObj = {
        exists: false,
        payload: {}
      };
      returnDataLogResponse(context);
    }
  });
};

module.exports.createNewDataSource = function(context) {
  var datasource = new DataSources(context.createdatasource);
  datasource.save(function(err,newdatasource) {
    if(err){
      console.log("error on save: "+err);
      context.responseObj ={
        status: "error"
      };
      returnDataLogResponse(context);
    }
    else
    {
      context.responseObj ={
        status: "ok",
        id: newdatasource._id
      };
      returnDataLogResponse(context);
    }
  });
};

module.exports.AddvisualToDataSource = function(context) {
  var data_id = context.addvisualtodatasource.data_id;
  DataSources.findOneAndUpdate({data_id: data_id}, {
      $push: { visuals: context.addvisualtodatasource.visual }
    },function(err, doc)
  {
    if(err){
      context.responseObj =  {
        status: "error"
      };
      returnDataLogResponse(context);
    } else {
      context.responseObj =  {
        status: "ok"
      };
      returnDataLogResponse(context);
    }

  });
};



returnDataLogResponse = function(context) {
  //put this shit into the log
  context.response.status(200).json(context.responseObj);
  var logEntry = new Logs(context.responseObj);
  logEntry.save(function(err,logentry) {
    if(err) {
      console.log("error on logentry"+err);
    } else {
      console.log("saved: logentry");
    }
  });
};
