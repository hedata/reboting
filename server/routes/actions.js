var ctrlBot = require('./bot_helper');
/*
  every action sends data to the bot
*/


module.exports.takeAction = function(req, res) {
  var context = {
    request: req,
    response: res,
    botparams: {
        session_id : req.body.userName
    },
    responseObj : {}
   };
  console.log("action type: "+req.body.type+" for very unsecure user: "+req.body.userName);
  switch(req.body.type) {
    case 'csvupload':
        ctrlBot.fulfillFacebookDataupload(context);
        break;
    case 'showvisual':
        console.log("showvisual");
        break;
    case 'query':
        context.botparams.query = req.body.payload.query;
        context.responseObj = {
          action:{
            status: "ok",
            payload: {}
          }
        };
        ctrlBot.askBot(context);
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
    default:
        console.log("action not implemented");
        res.status(200).json({
          action: { status: "ok"  },
          bot_response : { speach: "you suck" }
        })
}
};
