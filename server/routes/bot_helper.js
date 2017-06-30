/**
 * Created by hedata on 31.03.17.
 */
var apiai = require('apiai');
var app = apiai("f610e349415a4c64a579812f53a5679f");
var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var Logs = mongoose.model('Logs');
var Scripts = mongoose.model('Scripts');
var Visuals = mongoose.model('Visuals');
var request = require('request');

/*
 var context = {
 request: req,
 response: res,
 botparams: {
 session_id : req.body.userName
 },
 responseObj : {}
 };
 */


module.exports.saveVisual = function(context) {
  var visual = new Visuals(context.request.body.payload);
  visual.save(function(err,obj) {
    if(err) {
      console.log("error on logentry"+err);
    } else {
      context.response.status(200).json(obj);
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
    console.log(response);
    console.log(response.result.contexts);
    externalCalls(context);
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

/*
  hardcoded actions that need an external call
 */
externalCalls = function(context) {
  if(context.responseObj.bot_response.result.action && context.responseObj.bot_response.result.action === 'search_opendata'){
    if(!context.responseObj.bot_response.result.actionIncomplete) {
      var keywords = context.responseObj.bot_response.result.parameters.keywords;
      console.log("searching for: "+keywords);
      request('http://data.wu.ac.at/portalwatch/api/v1/search/datasets?limit=50&q='+keywords, function (error, response, body) {
        if(error) {
          console.log(error);
          addExecutionScripts(context);
        } else {
          context.responseObj.opendata_search_results = JSON.parse(body);
          addExecutionScripts(context);
        }
      });
    } else {
      addExecutionScripts(context);
    }
    // TODO make this happen
  } else if (context.responseObj.bot_response.result.action
            && context.responseObj.bot_response.result.action === 'analyze_csv_NOW'
            && !context.responseObj.bot_response.result.actionIncomplete) {
    var url = context.responseObj.bot_response.result.parameters.url;
    console.log('requesting url: '+url);
    request('http://data.wu.ac.at/csvengine/api/v1/profiler/'+url, function (error, response, body) {
      if(error) {
        console.log(error);
        addExecutionScripts(context);
      } else {
        if(response.statusCode === 200) {
          console.log('Request to analyze successfully finished :'+response.statusCode);
          //TODO make entry in database for data_source
          var datasource = new DataSources({
            type: 'opendataprofiled',
            profiler : JSON.parse(body)});
          datasource.save(function(err,obj) {
            if(err) {
              console.log("error on datasource save "+err);
              addExecutionScripts(context);
            } else {
              console.log("saved datasource: "+obj._id);
              // https://docs.api.ai/docs/contexts
              // https://github.com/api-ai/apiai-nodejs-client/blob/master/module/apiai.js
              var request = app.contextsRequest(
                [
                  {
                    "name": "datasource",
                    "lifespan": 10,
                    "parameters": obj
                  }
                ],
                { sessionId: context.botparams.session_id }
              );
              request.on('response', function(response) {
                console.log("context response");
                console.log(response);
              });
              request.on('error', function(error) {
                console.log("context response error");
                console.log(error);
              });
              request.end();


              //TODO save file on disk https://stackoverflow.com/questions/11944932/how-to-download-a-file-with-node-js-without-using-third-party-libraries
              addExecutionScripts(context);
            }
          });
        } else {
          addExecutionScripts(context);
        }
      }
    });
  } else {
    addExecutionScripts(context)
  }

};

addExecutionScripts = function(context) {
  if(context.responseObj.bot_response.result.action){
    if(!context.responseObj.bot_response.result.actionIncomplete) {
      console.log("searching for action: "+context.responseObj.bot_response.result.action);
      Scripts.findOne({action_name : context.responseObj.bot_response.result.action},function(err,obj) {
        if(obj) {
          context.responseObj.script = obj;
          returnJsonResponse(context)
        } else {
          returnJsonResponse(context)
        }
      });
    }else {
      returnJsonResponse(context)
    }
  } else {
    returnJsonResponse(context);
  }
};

returnJsonResponse = function(context) {
  //put this shit into the log
  context.response.status(200).json(context.responseObj);
  context.responseObj.bot_response.result.contexts = {};
  //console.log(context.responseObj);
  var logEntry = new Logs(context.responseObj);
  logEntry.save(function(err,logentry) {
    if(err) {
      console.log("error on logentry"+err);
    } else {
      console.log("saved: logentry");
    }
  });
};

/*

  Deprecated

 */
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
