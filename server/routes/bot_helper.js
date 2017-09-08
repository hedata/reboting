/**
 * Created by hedata on 31.03.17.
 */
var apiai = require('apiai');
var app = apiai("ebcf0040b9324ebf84475422b113d202");
var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var Logs = mongoose.model('Logs');
var Scripts = mongoose.model('Scripts');
var Visuals = mongoose.model('Visuals');
var request = require('request');
var async = require('async');

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
  var request;
  if(context.botparams.context) {
    //add context to responseobj
    context.responseObj.bot_context=context.botparams.context;
    console.log("Querying with context");
    console.log(context.botparams);
    request = app.textRequest(context.botparams.query, {
      sessionId: context.botparams.session_id,
      contexts: context.botparams.context
    });
  } else {
    request = app.textRequest(context.botparams.query, {
      sessionId: context.botparams.session_id
    });
  }
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
  // making it a parallel function and just returning when everything finished
  console.log("created new task");
  var calls = [];
  //search in opendata wu portal
  calls.push(function(callback){
    console.log("starting with searching in opendata");
    //TODO save this to db?
    if(context.responseObj.bot_response.result.action && context.responseObj.bot_response.result.action === 'search_opendata'){
      if(!context.responseObj.bot_response.result.actionIncomplete) {
        var topics = context.responseObj.bot_response.result.parameters.topics;
        var geolocation = context.responseObj.bot_response.result.parameters.geolocation;
        var requesturi ="http://data.wu.ac.at/odgraph/locationsearch?";
        //add limit param
        requesturi = requesturi+"limit=150";
        if(topics.length>0) {
          requesturi = requesturi+"&q="+topics.join(" ");
        }
        // split gelocations they are
        var gelocarr = geolocation.split("#%#");
        gelocarr.forEach(function(geoloc) {
          if(geolocation!=="") {
            if(geoloc.lastIndexOf("http",0)=== 0) {
              //we have a uri
              requesturi = requesturi+"&l="+geoloc;
            }
          }
        });
        console.log("searching for: "+requesturi);
        request(requesturi, function (error, response, body) {
          if(error) {
            console.log(error);
            callback(null,"returning from search opendata error");
          } else if(response.statusCode === 200) {
            context.responseObj.opendata_search_results = JSON.parse(body);
            callback(null,"returning from search opendata all good");
          } else {
            callback(null,"api seems to be down");
          }
        });
      } else {
        callback(null,"returning from search opendata error");
      }
    }
    else if(context.responseObj.bot_response.result.action &&
      context.responseObj.bot_response.result.action === 'show_random_visual' &&
      !context.responseObj.bot_response.result.actionIncomplete) {
      /*
        show random visual part
        choose params
       */
      //search our set
      var randtopics = context.responseObj.bot_response.result.parameters.topics;
      var randgeolocation = context.responseObj.bot_response.result.parameters.geolocation;
      var randrequesturi = "http://data.wu.ac.at/odgraph/locationsearch?";
      //add limit param
      randrequesturi = randrequesturi + "limit=150";
      if (randtopics.length > 0) {
        randrequesturi = randrequesturi + "&q=" + randtopics.join(" ");
      }
      // split gelocations they are
      var randgelocarr = randgeolocation.split("#%#");
      randgelocarr.forEach(function (geoloc) {
        if (geolocation !== "") {
          if (geoloc.lastIndexOf("http", 0) === 0) {
            //we have a uri
            randrequesturi = randrequesturi + "&l=" + geoloc;
          }
        }
      });
      findRandomData(context, callback, randrequesturi);
    } else if (context.responseObj.bot_response.result.action &&
      context.responseObj.bot_response.result.action === 'not_like' &&
      !context.responseObj.bot_response.result.actionIncomplete){
      console.log("THIS IS NOT LIKE BOT RESPONSE I NEED THE CONTEXT");
      console.log(context.responseObj.bot_response.result.contexts);
      var uri = context.responseObj.bot_response.result.contexts[0].parameters.request_uri;
      //TODO save rating!


      findRandomData(context, callback, uri);
    } else {
      callback(null,"returning from search opendata error");
    }
  });
  //search in 23degree api

  //add execution scripts
  calls.push(function(callback) {
    addExecutionScripts(context,callback);
  });
  console.log("starting async with calls: "+calls.length);
  async.parallel(calls, function(err, result) {
    /* this code will run after all calls finished the job or
     when any of the calls passes an error */
    console.log("in the callback of the async parallel call")
    if (err) {
      console.log(err);
      returnJsonResponse(context);
    } else {
      returnJsonResponse(context);
    }
  });



  /*else if (context.responseObj.bot_response.result.action
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
  }*/
};

findRandomData = function(context,callback,requesturi) {
  console.log("searching for: "+requesturi);
  request(requesturi, function (error, response, body) {
    if(error) {
      console.log(error);
      callback(null,"returning from search opendata error");
    } else if(response.statusCode === 200) {
      //TODO better error handling
      var results = JSON.parse(body).results;
      //select a random item
      var selecteditem = results[Math.floor(Math.random()*results.length)];
      //only return interesting part of the item as params
      if(selecteditem.dataset) {
        context.responseObj.bot_context=  [{
          name: 'wudatasearchresult',
          lifespan: 10,
          parameters: {
            url: selecteditem.url,
            name: selecteditem.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' ),
            description: selecteditem.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' ),
            portal: selecteditem.portal.replace(/(\r\n|\n|\r)/gm, '' ),
            publisher: selecteditem.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' ),
            user_id : context.botparams.session_id,
            request_uri: requesturi
          }
        }];
      } else {
        context.responseObj.bot_context=  [{
          name: 'wudatasearchresult',
          lifespan: 10,
          parameters: {
            url: selecteditem.url,
            name: "no name available",
            description: "no description available",
            portal: selecteditem.portal.replace(/(\r\n|\n|\r)/gm, '' ),
            publisher: "no publisher available",
            user_id : context.botparams.session_id,
            request_uri: requesturi
          }
        }];
      }
      console.log("FOUND A RANDOM FILE: ");
      console.log(context.responseObj.bot_context);
      callback(null,"returning from random search all good");
    } else {
      callback(null,"api seems to be down");
    }
  });
};

addExecutionScripts = function(context,callback) {
  if(context.responseObj.bot_response.result.action){
    if(!context.responseObj.bot_response.result.actionIncomplete) {
      console.log("searching for action: "+context.responseObj.bot_response.result.action);
      Scripts.findOne({action_name : context.responseObj.bot_response.result.action},function(err,obj) {
        if(obj) {
          context.responseObj.script = obj;
          callback(null,"returning from execution script all good");
        } else {
          callback(null,"nothing to add from exection script");
        }
      });
    }else {
      callback(null,"nothing to add from exection script");
    }
  } else {
    callback(null,"nothing to add from exection script");
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
