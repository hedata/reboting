var ctrlBot = require('./bot_helper');
var mongoose = require('mongoose');
var Visuals = mongoose.model('Visuals');
var dataHelper = require('./data_helper');
/*
  every action sends data to the bot

  The most important object is the context object which is given down to every subfunction call

  context = {
      request : http Request Object (has request params and req body),
      response: http response Object (can be used to send responses),
      botbarams: {
        session_id : Unique identifier of the Session for API ai,
        query? : Text the user entered,
        visual_id? : id defining the visual
      }
      responseObj : {
         action:{
         status: "ok",
         payload: {

         },
         bot_response : {

         },
         script? : if a script was found that needs to be executed on the client
         visual? : if a visual was found its attached here as visual object
         opendata_search_results? : if it is an opendata visual its attached here
      }

  }

  The request always has:
  request.body.type
  request.body.payload



*/


module.exports.takeAction = function(req, res) {
  var context = {
    request: req,
    response: res,
    botparams: {
        session_id : req.body.userid
    },
    responseObj : {}
   };
  console.log("action type: "+req.body.type+" for user: "+req.body.userid);
  switch(req.body.type) {
    case 'csvupload':
        ctrlBot.fulfillFacebookDataupload(context);
        break;
    case 'save_visual':
        console.log("save_visual");
        ctrlBot.saveVisual(context);
        break;
    case 'query':
        context.botparams.query = req.body.payload.query;
        if(req.body.payload.context) {
          context.botparams.context = req.body.payload.context;
        }
        context.responseObj = {
          action:{
            status: "ok",
            payload: {}
          }
        };
        ctrlBot.askBot(context);
        break;
    case 'show_visual':
        //find Visual in Db and return the object
        var visual_id = req.body.payload.visual_id;
        Visuals.findOne({_id : visual_id}).exec(function(err,obj){
          if(obj) {
            console.log("sending response");
            context.responseObj = {
              action:{
                status: "ok",
                payload: {}
              }
            };
            context.responseObj.visual = obj;
            res.status(200).json(context.responseObj);
          }
        });
        break;
    case 'testing':
        context.botparams.event = {
          name: "facebook_insights_upload",
          data: {
              filename: "myfacebookfile.csv"
          }
        };
        context.responseObj = {
          action:{
            status: "ok",
            payload: {}
          }
        };
        ctrlBot.botEvent(context);
        break;
    case 'checkforknowncsv':
        console.log("checkingforcsv");
        context.checkforknowncsv = {url: req.body.url};
        dataHelper.queryDataExists(context);
        break;
    case 'createdatasource':
      console.log("createdatasource");
      context.createdatasource = req.body.payload;
      dataHelper.createNewDataSource(context);
      break;
    case 'addvisualtodatasource':
      console.log("addvisualtodatasource");
      context.addvisualtodatasource = req.body.payload;
      dataHelper.AddvisualToDataSource(context);
      break;
    default:
        console.log("action not implemented");
        res.status(200).json({
          action: { status: "ok"  },
          bot_response : { speach: "you suck" }
        })
}
};
