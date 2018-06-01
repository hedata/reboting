/**
 * Created by hedata on 31.03.17.
 */
let mongoose = require('mongoose');
let DataSources = mongoose.model('DataSources');
let Logs = mongoose.model('Logs');
let Scripts = mongoose.model('Scripts');
let Visuals = mongoose.model('Visuals');
let Users = mongoose.model('Users');
let Ratings = mongoose.model('Ratings');
let UserSearchResults = mongoose.model('UserSearchResults');

// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();

// Send request and log result
module.exports.askBot = function(context) {
  //console.log(context);
  // You can find your project ID in your Dialogflow agent settings
  const projectId = 'reboting-3907e'; //https://dialogflow.com/docs/agents#settings
  const sessionId = context.botparams.session_id;
  const languageCode = 'en-US';
  // Define session path
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: context.botparams.query,
        languageCode: languageCode,
      },
    },
  };
  sessionClient
    .detectIntent(request)
    .then(responses => {
      console.log('Detected intent');
      const result = responses[0].queryResult;
      console.log(`  Query: ${result.queryText}`);
      console.log(`  Response: ${result.fulfillmentText}`);
      if (result.intent) {
        console.log(`  Intent: ${result.intent.displayName}`);
      } else {
        console.log(`  No intent matched.`);
      }
      console.log(responses);
      context.responseObj.bot_response = responses[0].queryResult;        
      context.response.status(200).json(context.responseObj);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
}
