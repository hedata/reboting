/**
 * Created by hedata on 31.03.17.
 */
var apiai = require('apiai');
var app = apiai("f610e349415a4c64a579812f53a5679f");
var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var Logs = mongoose.model('Logs');


module.exports.fulfillFacebookDataupload = function(context) {
  //console.log(req.body.payload);
  var datasource = new DataSources(context.request.body.payload);
  datasource.save(function(err,newdatasource) {
    if(err){
      console.log("error on save: "+err);
      context.response.status(500).json({'error': 'error on save: '+err})
    }
    else
    {
      context.botparams.event = {
        name: "facebook_insights_upload",
        data: {
          filename: newdatasource.fileName
        }
      };
      context.responseObj.action={
        status: "ok",
        payload: { data: newdatasource }
      };
      botEvent(context);
    }
  });
};


module.exports.askBot = function(context) {
  askBot(context);
};
module.exports.botEvent = function(context) {
  botEvent(context);
};

askBot = function(context) {
  var request = app.textRequest(context.botparams.query, {
    sessionId: context.botparams.session_id
  });
  request.on('response', function(response) {
    context.responseObj.bot_response = response;
    //Place for additonal querying
    returnJsonResponse(context);
  });
  request.on('error', function(error) {
    context.response.status(500).json({'error': 'error on bot query: '+error});
  });
  request.end();
};
botEvent = function(context) {
  var request = app.eventRequest(context.botparams.event, {
    sessionId: context.botparams.session_id
  });
  request.on('response', function(response) {
    context.responseObj.bot_response = response;
    returnJsonResponse(context);
  });
  request.on('error', function(error) {
    console.log(error);
  });
  request.end();
};

returnJsonResponse = function(context) {
  //put this shit into the log
  context.response.status(200).json(context.responseObj);
  context.responseObj.bot_response.result.contexts = {};
  //console.log(context.responseObj);
  var logEntry = new Logs(context);
  logEntry.save(function(err,logentry) {
    if(err) {
      console.log("error on logentry"+err);
    } else {
      console.log("saved: logentry");
    }
  });
};
