let apiai = require('apiai');
let mongoose = require('mongoose');
let DataSources = mongoose.model('DataSources');
let Logs = mongoose.model('Logs');
let Scripts = mongoose.model('Scripts');
let Users = mongoose.model('Users');
let Visuals = mongoose.model('Visuals');
let ExternalVisuals = mongoose.model('ExternalVisuals');


module.exports.queryDataExists = function(context) {
  DataSources.findOne({url: context.checkforknowncsv.url}).exec(function(err,obj){
    if(obj) {
      console.log(new Date()+ " Data exists: "+ context.checkforknowncsv.url);
      context.responseObj = {
        exists: true,
        payload: obj
      };
      returnDataLogResponse(context);
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
      context.responseObj ={
        status: "ok",
        id: newDataSource._id
      };
      returnDataLogResponse(context);
    }
  });
};

module.exports.AddvisualToDataSource = function(context) {
  let data_id = context.addvisualtodatasource.data_id;
  console.log(new Date()+": Creating Visual and Adding it to Data Source DataID: "+data_id+" Visual: "+context.addvisualtodatasource.visual.slug);
  //console.log(context.addvisualtodatasource);
  let visual = new ExternalVisuals(context.addvisualtodatasource);
  visual.save(function(err) {
   if(err) {
     console.log(new Date()+": Error on Saving Visual "+err);
     returnDataLogResponse(context);
   } else {
     DataSources.findOneAndUpdate({data_id: data_id}, {
       $push: { visuals: context.addvisualtodatasource.visual.slug }
     },function(err)
     {
       if(err){
         context.responseObj =  {
           status: "error"
         };
         returnDataLogResponse(context);
       } else {
         context.responseObj =  {
           status: "ok"
         };
         //save visual as current for the user, create user if he doenst exist yet
         Users.findOneAndUpdate({user_id: context.addvisualtodatasource.user_id}, // find a document with that filter
           {  user_id : context.addvisualtodatasource.user_id,
             current_data_id : context.addvisualtodatasource.data_id,
             current_slug : context.addvisualtodatasource.visual.slug}, // document to insert when nothing was found
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

       }

     });
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
