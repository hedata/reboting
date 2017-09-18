var apiai = require('apiai');
var app = apiai("ebcf0040b9324ebf84475422b113d202");
var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var Logs = mongoose.model('Logs');
var Scripts = mongoose.model('Scripts');
var Users = mongoose.model('Users');
var Visuals = mongoose.model('Visuals');
var ExternalVisuals = mongoose.model('ExternalVisuals');
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
  console.log("SAVING VISUAL:");
  //console.log(context.addvisualtodatasource);
  var visual = new ExternalVisuals(context.addvisualtodatasource);
  visual.save(function(err,newdatasource) {
   if(err) {
     console.log("error on save "+err);
     returnDataLogResponse(context);
   } else {
     DataSources.findOneAndUpdate({data_id: data_id}, {
       $push: { visuals: context.addvisualtodatasource.visual.slug }
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
         //save visual as current for the user, create user if he doenst exist yet
         Users.findOneAndUpdate({user_id: context.addvisualtodatasource.user_id}, // find a document with that filter
           {  user_id : context.addvisualtodatasource.user_id,
             current_data_id : context.addvisualtodatasource.data_id,
             current_slug : context.addvisualtodatasource.visual.slug}, // document to insert when nothing was found
           {upsert: true, new: true}, // options
           function (err, doc) { // callback
             if (err) {
               console.log("error on save "+err);
               // handle error
               returnDataLogResponse(context);
             } else {
               // handle document
               returnDataLogResponse(context);
             }
           }
         );

       }

     });
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
