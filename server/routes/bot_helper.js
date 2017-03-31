/**
 * Created by hedata on 31.03.17.
 */

module.exports.askBot = function(query,session_id,req,res,responseObject) {
  console.log("greeting from bot");
  var apiai = require('apiai');

  var app = apiai("f610e349415a4c64a579812f53a5679f");

  var request = app.textRequest(query, {
        sessionId: session_id
  });

  request.on('response', function(response) {
        console.log("setting response");
        responseObject.bot_response = response;
        res.status(200).json(responseObject);
  });
  request.on('error', function(error) {
        console.log(error);
    });

    request.end();
};

module.exports.askBotevent = function(query,session_id, req, res ,responseObject) {
  console.log("greeting from bot");
  var apiai = require('apiai');
  var event = {
    name: "facebook_insights_upload",
    data: {
        filename: "myfacebookfile.csv",
    }
  };
  var app = apiai("f610e349415a4c64a579812f53a5679f");
    var request = app.eventRequest(event, {
          sessionId: session_id
    });

  request.on('response', function(response) {
        console.log("setting response");
        responseObject.bot_response = response;
        res.status(200).json(responseObject);
  });
  request.on('error', function(error) {
        console.log(error);
    });

    request.end();

}
