var ctrlBot = require('./bot_helper');
/*
  every action sends data to the bot
*/


module.exports.takeAction = function(req, res) {
  var context = {
    request: req,
    response: res,
    botparams: {
        session_id : "12346567203949465445321"
    },
    responseObj : {}
   };
  console.log("taking action");
  console.log("action type: "+req.body.type);
  switch(req.body.type) {
    case 'csvupload':
        ctrlBot.fulfillFacebookDataupload(context);
        break;
    case 'showvisual':
        console.log("showvisual");
        break;
    case 'helloworld':
        context.botparams.query = "HO";
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
