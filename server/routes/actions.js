var mongoose = require('mongoose');
var DataSources = mongoose.model('DataSources');
var ctrlBot = require('./bot_helper');

module.exports.takeAction = function(req, res) {
  //console.log(req.body);
  console.log("taking action");
  console.log("action type: "+req.body.type);
  switch(req.body.type) {
    case 'facebookdataupload':
        fulfillFacebookDataupload(req,res);
        break;
    case 'showvisual':
        console.log("showvisual");
        break;
    case 'helloworld':
        ctrlBot.askBot('HI','12346567203949465445321',req,res,{
          action:{
            status: "ok",
            payload: {}
          }
        })
        break;
    case 'testing':
        ctrlBot.askBotevent('facebook_insights_upload','12346567203949465445321',req,res,{
          action:{
            status: "ok",
            payload: {}
          }
        });
        break;
    default:
        console.log("action note implemented");
        res.status(200).json({
          action: { status: "ok"  },
          bot_response : { speach: "you suck" }
        })
}
};

fulfillFacebookDataupload = function(req,res) {
   var datasource = new DataSources(req.body.payload);
   datasource.save(function(err,newdatasource) {
  if(err){ }
    else
    {
      ctrlBot.askBot('hello dabi from our express route','12346567203949465445321',req,res,{
        action:{
          status: "ok",
          payload: newdatasource
        }
      });
    }
  });
};
