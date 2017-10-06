
let mongoose = require('mongoose');
let DataSources = mongoose.model('DataSources');
let Logs = mongoose.model('Logs');
let Scripts = mongoose.model('Scripts');
let Users = mongoose.model('Users');
let Visuals = mongoose.model('Visuals');
let ExternalVisuals = mongoose.model('ExternalVisuals');
let VisualHelper = require('./visual_helper');

module.exports.queryDataExists = function(context) {
  DataSources.findOne({url: context.checkforknowncsv.url}).exec(function(err,obj){
    if(obj) {
      let randVisualSlug = obj.visuals[Math.floor(Math.random() * obj.visuals.length)];
      console.log(new Date()+ " Data exists: "+ context.checkforknowncsv.url+" Random Slug for showing: "+randVisualSlug);
      context.responseObj = {
        exists: true,
        slug: randVisualSlug
      };
      returnDataLogResponse(context);
      //do this as  current visual that user is looking at
      let userid = context.checkforknowncsv.userid;
      //save visual as current for the user, create user if he doenst exist yet
      Users.findOneAndUpdate({user_id: userid}, // find a document with that filter
        {  user_id : userid,
          current_data_id : obj.data_id,
          current_slug : randVisualSlug}, // document to insert when nothing was found
        {upsert: true, new: true}, // options
        function (err) { // callback
          if (err) {
            console.log(new Date()+": Error on User Save "+err);
            // handle error
            returnDataLogResponse(context);
          } else {
            // handle document
            returnDataLogResponse(context);
          }
        }
      );

    } else {
      console.log(new Date()+ " Data Does Not exist: "+ context.checkforknowncsv.url);
      context.responseObj = {
        exists: false,
        payload: {}
      };
      returnDataLogResponse(context);
    }
  });
};

module.exports.createNewDataSource = function(context) {
  let dataSource = new DataSources(context.createdatasource);
  dataSource.save(function(err,newDataSource) {
    if(err){
      console.log(new Date()+": Error on save new Data Source: "+err);
      context.responseObj ={
        status: "error"
      };
      returnDataLogResponse(context);
    }
    else
    {
      //create all possible visuals and return slug of first created
      //keep creating visuals afterwards
      let created = 0;
      console.log(new Date()+ " Starting Creating Visuals:");

      let visualsToCreate = [];
      //map possibilities
      if(newDataSource.isoField!==null && newDataSource.isoField!=="")
      {
        newDataSource.stringColumnlist.forEach(function(stringColumn) {
          newDataSource.numericColumnlist.forEach(function(numericColumn){
            console.log(new Date()+ " Creating Job for Visual String Column: "+stringColumn+" numeric Column: "+numericColumn+" IsoField: "+newDataSource.isoField);
            visualsToCreate.push({
              type : "map",
              stringColumn : stringColumn,
              numericColumn : numericColumn,
              isoField: newDataSource.isoField
            })
          })
        })
      }
      //barchart possibilities:
      // - we can create charts for each combination of string fields and numeric fields
      newDataSource.stringColumnlist.forEach(function(stringColumn) {
        newDataSource.numericColumnlist.forEach(function(numericColumn){
          console.log(new Date()+ " Creating Bar Visual String Column: "+stringColumn+" numeric Column: "+numericColumn);
          visualsToCreate.push({
            type : "bar",
            stringColumn : stringColumn,
            numericColumn : numericColumn,
            isoField: newDataSource.isoField
          });
        })
      });
      VisualHelper.createVisualRecursive(context,newDataSource,created,visualsToCreate);
    }
  });
};




returnDataLogResponse = function(context) {
  //put this shit into the log
  context.response.status(200).json(context.responseObj);
  let logEntry = new Logs(context.responseObj);
  logEntry.save(function(err) {
    if(err) {
      console.log(new Date()+" Error on Saving Log in Data Helper: "+err);
    }
  });
};
