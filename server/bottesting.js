/**
 * Created by hedata on 31.03.17.
 */

module.exports.greetBot = function(query,session_id) {
  console.log("greeting from bot");
  var apiai = require('apiai');

  var app = apiai("f610e349415a4c64a579812f53a5679f");

  var request = app.textRequest(query, {
        sessionId: session_id
  });

  request.on('response', function(response) {
        console.log(response);
  });

  request.on('error', function(error) {
        console.log(error);
    });

    request.end();
};
