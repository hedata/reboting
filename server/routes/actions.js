let ctrlBot = require('./bot_helper');
let ctrlBotV2 = require('./bot_helper_apiv2');
let mongoose = require('mongoose');
let Visuals = mongoose.model('Visuals');
let dataHelper = require('./data_helper');
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
  let context = {
    request: req,
    response: res,
    botparams: {
        session_id : req.body.userid
    },
    responseObj : {}
   };
  console.log(new Date()+"########################################################################");
  console.log(new Date()+ " request: action type: "+req.body.type+" for user: "+req.body.userid);
  switch(req.body.type) {
    case 'query':
        context.botparams.query = req.body.payload.query;
        context.responseObj = {
          action:{
            status: "ok",
            payload: {}
          }
        };
        if(req.body.payload.context) {
          context.botparams.context = req.body.payload.context;
        }
        //ctrlBot.askBot(context);
        ctrlBotV2.askBot(context);
        break;
    case 'checkforknowncsv':
        console.log(new Date()+": Begin Checking for known CSV  url: "+req.body.url);
        context.checkforknowncsv = {url: req.body.url, userid : req.body.userid};
        dataHelper.queryDataExists(context);
        break;
    case 'createdatasource':
      console.log(new Date()+": Begin Create Data Source");
      context.createdatasource = req.body.payload;
      dataHelper.createNewDataSource(context);
      break;
    case 'csvupload':
      ctrlBot.fulfillFacebookDataupload(context);
      break;
    case 'save_visual':
      console.log(new Date()+": Begin save_visual");
      ctrlBot.saveVisual(context);
      break;
    case 'show_visual':
      //find Visual in Db and return the object
      let visual_id = req.body.payload.visual_id;
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
    /*case 'addvisualtodatasource':
      console.log(new Date()+": Begin Add Visual to Data Source");
      context.addvisualtodatasource = req.body.payload;
      dataHelper.AddvisualToDataSource(context);
      break;*/
    default:
        console.log(new Date()+": Error: action not implemented");
        res.status(200).json({
          action: { status: "ok"  },
          bot_response : { speach: "you suck" }
        })
}
};
