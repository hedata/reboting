/**
 * Created by hedata on 31.03.17.
 */
let apiai = require('apiai');
let app = apiai("ebcf0040b9324ebf84475422b113d202");
let mongoose = require('mongoose');
let DataSources = mongoose.model('DataSources');
let Logs = mongoose.model('Logs');
let Scripts = mongoose.model('Scripts');
let Visuals = mongoose.model('Visuals');
let Users = mongoose.model('Users');
let Ratings = mongoose.model('Ratings');
let request = require('request');
let async = require('async');
let UserSearchResults = mongoose.model('UserSearchResults');

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
  let visual = new Visuals(context.request.body.payload);
  visual.save(function(err,obj) {
    if(err) {
      console.log(new Date()+"error on Save Visual "+err);
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
  let request;
  if(context.botparams.context) {
    //add context to responseobj
    context.responseObj.bot_context=context.botparams.context;
    console.log(new Date()+"Querying with context");
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
    console.log(new Date()+": got response from API AI");
    //console.log(response);
    //console.log(response.result.contexts);
    externalCalls(context);
  });
  request.on('error', function(error) {
    context.response.status(500).json({'error': 'error on bot query: '+error});
  });
  request.end();
};
botEvent = function(context) {
  let request = app.eventRequest(context.botparams.event, {
    sessionId: context.botparams.session_id
  });
  request.on('response', function(response) {
    context.responseObj.bot_response = response;
    returnJsonResponse(context);
  });
  request.on('error', function(error) {
    console.log(new Date()+"Error on Request to API AI "+error);
  });
  request.end();
};

/*
  hardcoded actions that need an external call
 */
externalCalls = function(context) {
  // making it a parallel function and just returning when everything finished
  console.log(new Date()+" Starting external Calls");
  let calls = [];
  //search in opendata wu portal
  calls.push(function(callback){
    console.log("starting with searching in opendata");
    if(context.responseObj.bot_response.result.action && context.responseObj.bot_response.result.action === 'search_opendata'){
      if(!context.responseObj.bot_response.result.actionIncomplete) {
        let topics = context.responseObj.bot_response.result.parameters.topics;
        let geolocation = context.responseObj.bot_response.result.parameters.geolocation;
        let requesturi ="http://data.wu.ac.at/odgraph/locationsearch?";
        //add limit param
        requesturi = requesturi+"limit=50";
        if(topics.length>0) {
          requesturi = requesturi+"&q="+topics.join(" ");
        }
        // split gelocations they are
        let gelocarr = geolocation.split("#%#");
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
            console.log(new Date()+" Error on Request OpenData Search "+error);
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
      //create request uri
      let randtopics = context.responseObj.bot_response.result.parameters.topics;
      let randgeolocation = context.responseObj.bot_response.result.parameters.geolocation;
      let randrequesturi = "http://data.wu.ac.at/odgraph/locationsearch?";
      //add limit param
      randrequesturi = randrequesturi + "limit=1";
      if (randtopics.length > 0) {
        randrequesturi = randrequesturi + "&q=" + randtopics.join(" ");
      }
      // split gelocations they are
      let randgelocarr = randgeolocation.split("#%#");
      randgelocarr.forEach(function (geoloc) {
        if (randgeolocation !== "") {
          if (geoloc.lastIndexOf("http", 0) === 0) {
            //we have a uri
            randrequesturi = randrequesturi + "&l=" + geoloc;
          }
        }
      });
      //base request uri is done with a limit of 1 so we always get one
      //item
      //the offset now tells us at which location we are
      //we also need to save the offset in a user specific table
      //check if this already exists?
      //save visual as current for the user, create user if he doenst exist yet
      UserSearchResults.findOne({
          user_id: context.botparams.session_id,
          request_uri : randrequesturi
        }, // options
        function (err,obj) { // callback
          if (obj) {
            //exists take offset +1 if offset < listsize otherwise start at 0
            if(obj.offset < obj.results-1) {
              findRandomData(context, callback, randrequesturi,obj.offset+1);
            } else {
              findRandomData(context, callback, randrequesturi,0);
            }
          } else {
            //use normal offset
            findRandomData(context, callback, randrequesturi,0);
          }
        }
      );
    }
    else if (context.responseObj.bot_response.result.action &&
      context.responseObj.bot_response.result.action === 'not_like' &&
      !context.responseObj.bot_response.result.actionIncomplete){
      console.log(new Date()+": start Rating - NOT LIKE");
      let contextParams = context.responseObj.bot_response.result.contexts[0].parameters;
      let uri = contextParams.request_uri;
      Users.findOne({ user_id : contextParams.user_id }).exec(function(err,userObj){
        if(userObj) {
          //saverating
          let rating = new Ratings( {
            user_id : userObj.user_id,
            slug : userObj.current_slug,
            data_id : userObj.current_data_id,
            rating : -1,
            description: contextParams.description,
            request_uri: contextParams.request_uri,
            url: contextParams.url,
            name: contextParams.name,
            publisher: contextParams.publisher,
            search_rank: contextParams.search_rank,
            portal: contextParams.portal,
            geolocation: contextParams.geolocation
          });
          rating.save(function(err) {
            if(err) {
              console.log(new Date()+": Error on Rating save "+err);
              findRandomData(context, callback, uri,0);
            } else {
              //this is where everything should work out
              UserSearchResults.findOne({
                  user_id: context.botparams.session_id,
                  request_uri : uri
                }, // options
                function (err,obj) { // callback
                  if (obj) {
                    //exists take offset +1 if offset < listsize otherwise start at 0
                    if(obj.offset < obj.results-1) {
                      findRandomData(context, callback, uri,obj.offset+1);
                    } else {
                      findRandomData(context, callback, uri,0);
                    }
                  } else {
                    //use normal offset
                    findRandomData(context, callback, uri,0);
                  }
                }
              );
            }
          });

        }
        else {
          console.log("couldnt find user: "+err);
          findRandomData(context, callback, uri,0);
        }
      });
    }
    else if (context.responseObj.bot_response.result.action &&
      context.responseObj.bot_response.result.action === 'like' &&
      !context.responseObj.bot_response.result.actionIncomplete){
      console.log("THIS IS LIKE BOT RESPONSE I NEED THE CONTEXT");
      let contextParams2 = context.responseObj.bot_response.result.contexts[0].parameters;
      let uri2 = contextParams2.request_uri;
      console.log(contextParams2);
      Users.findOne({ user_id : contextParams2.user_id }).exec(function(err,userobj){
        if(userobj) {
          //saverating
          let rating = new Ratings( {
            user_id : userobj.user_id,
            slug : userobj.current_slug,
            data_id : userobj.current_data_id,
            rating : 1,
            description: contextParams2.description,
            request_uri: contextParams2.request_uri,
            url: contextParams2.url,
            name: contextParams2.name,
            publisher: contextParams2.publisher,
            search_rank: contextParams2.search_rank,
            portal: contextParams2.portal,
            geolocation: contextParams2.geolocation
          });
          rating.save(function(err) {
            if(err) {
              console.log(new Date()+": Rating error on save "+err);
              findRandomData(context, callback, uri2,0);
            } else {
              UserSearchResults.findOne({
                  user_id: context.botparams.session_id,
                  request_uri : uri2
                }, // options
                function (err,obj) { // callback
                  if (obj) {
                    //exists take offset +1 if offset < listsize otherwise start at 0
                    if(obj.offset < obj.results-1) {
                      findRandomData(context, callback, uri2,obj.offset+1);
                    } else {
                      findRandomData(context, callback, uri2,0);
                    }
                  } else {
                    //use normal offset
                    findRandomData(context, callback, uri2,0);
                  }
                }
              );
            }
          });

        }
        else {
          console.log(new Date()+": could not find user:"+ contextParams2.user_id +" "+err);
          findRandomData(context, callback, uri2,0);
        }
      });
    }
    else {
      callback(null,"returning from search OpenData error");
    }
  });
  //add execution scripts
  calls.push(function(callback) {
    addExecutionScripts(context,callback);
  });
  console.log(new Date()+": starting async with calls: "+calls.length);
  async.parallel(calls, function(err, result) {
    /* this code will run after all calls finished the job or
     when any of the calls passes an error */
    console.log(new Date()+": in the callback of the async parallel call");
    if (err) {
      console.log(new Date()+": error on async callback "+err);
      returnJsonResponse(context);
    } else {
      console.log(new Date()+": finished async callback with: "+result);
      returnJsonResponse(context);
    }
  });




};

findRandomData = function(context,callback,requesturi,offset) {
  console.log("searching for: "+requesturi+"&offset="+offset);
  request(requesturi+"&offset="+offset, function (error, response, body) {
    if(error) {
      console.log(error);
      callback(null,"returning from search opendata error");
    } else if(response.statusCode === 200) {
      let resBody = JSON.parse(body);
      let results = resBody.results;
      //select a random item
      let selecteditem = results[0];
      //only return interesting part of the item as params
      //safely create the context object
      let name = "No name available";
      if(selecteditem.dataset && selecteditem.dataset.dataset_name) {
        name= selecteditem.dataset.dataset_name.replace(/(\r\n|\n|\r)/gm, '' );
      }
      let description = "No description available";
      if(selecteditem.dataset && selecteditem.dataset.dataset_description) {
        description= selecteditem.dataset.dataset_description.replace(/(\r\n|\n|\r)/gm, '' );
      }
      let portal = "No Portal available";
      if(selecteditem.port) {
        portal = selecteditem.portal.replace(/(\r\n|\n|\r)/gm, '' );
      }
      let publisher = "no publisher available";
      if(selecteditem.dataset && selecteditem.dataset.publisher) {
        publisher = selecteditem.dataset.publisher.replace(/(\r\n|\n|\r)/gm, '' );
      }
      context.responseObj.bot_context=  [{
          name: 'wudatasearchresult',
          lifespan: 10,
          parameters: {
            search_rank : offset,
            url: selecteditem.url,
            name: name,
            description: description,
            portal: portal,
            publisher: publisher,
            user_id : context.botparams.session_id,
            request_uri: requesturi
          }
        }];
      /*
        Save for this user and this request uri where we are now and how many results there are
       */
      //save visual as current for the user, create user if he doenst exist yet
      UserSearchResults.findOneAndUpdate({
          user_id: context.botparams.session_id,
          request_uri : requesturi
        }, // find a document with that filter
        {
          user_id : context.botparams.session_id,
          request_uri : requesturi,
          results : resBody.total,
          offset: offset
        }, // document to insert when nothing was found
        {upsert: true, new: true}, // options
        function (err) { // callback
          if (err) {
            console.log(new Date()+": Error on UserSearchResults Save "+err);
          }
        }
      );
      console.log(new Date()+": SearchResult found");
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
      console.log(new Date()+": searching for action: "+context.responseObj.bot_response.result.action);
      Scripts.findOne({action_name : context.responseObj.bot_response.result.action},function(err,obj) {
        if(obj) {
          context.responseObj.script = obj;
          callback(null,"returning from execution script all good");
        } else {
          callback(null,"nothing to add from exection script");
        }
      });
    }else {
      callback(null,"nothing to add from Execution Script");
    }
  } else {
    callback(null,"nothing to add from Execution script");
  }
};

returnJsonResponse = function(context) {
  context.response.status(200).json(context.responseObj);
  context.responseObj.bot_response.result.contexts = {};
  let logEntry = new Logs(context.responseObj);
  logEntry.save(function(err) {
    if(err) {
      console.log(new Date()+": Error on Log Save: "+err);
    } else {
      console.log(new Date()+": Log Saved");
    }
  });
};

/*

  Deprecated

 */
module.exports.fulfillFacebookDataupload = function(context) {
  let dataSource = new DataSources(context.request.body.payload);
  dataSource.save(function(err,newDataSource) {
    if(err){
      console.log("error on save: "+err);
      context.response.status(500).json({'error': 'error on save: '+err})
    }
    else
    {
      context.botparams.event = {
        name: "facebook_insights_upload",
        data: {
          filename: newDataSource.fileName
        }
      };
      context.responseObj.action={
        status: "ok",
        payload: { data: newDataSource }
      };
      botEvent(context);
    }
  });
};

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
