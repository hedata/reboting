let request = require('request');
let mongoose = require('mongoose');
let DataSources = mongoose.model('DataSources');
let Logs = mongoose.model('Logs');
let Scripts = mongoose.model('Scripts');
let Users = mongoose.model('Users');
let Visuals = mongoose.model('Visuals');
let ExternalVisuals = mongoose.model('ExternalVisuals');




module.exports.createVisualRecursive = function createVisualRecursive (context,newDataSource,created,toCreateArray){
  let current = toCreateArray[created];
  //create visual
  let queryObj = {};
  if(current.type === "map") {
    queryObj = generateMapQueryObject(newDataSource,current.numericColumn,current.stringColumn,newDataSource.isoField);
  } else {
    queryObj = generateBarChartQueryObject(newDataSource,current.numericColumn,current.stringColumn);
  }
  console.log(new Date()+ " querying server to create visual");
  request({
    url: "http://52.166.116.205:2301/create_visual",
    method: "POST",
    json: true,
    body: queryObj
  }, function (error, response, body){
    if (!error && response.statusCode === 200) {
      console.log(body);
      let slug ="";
      if(body.slug) {
        slug = body.slug;
        console.log(new Date()+" got new visual slug: "+slug);
      } else {
        console.log(new Date()+" ERROR got now slug"+body);
      }
      //add it to datasource and save it in the db
      let VisualObj = {
        user_id : context.botparams.session_id,
        data_id : newDataSource.data_id,
        slug : slug,
        visual : queryObj
      };
      let visual = new ExternalVisuals(VisualObj);
      visual.save(function(err) {
        if(err) {
          console.log(new Date()+": Error on Saving Visual "+err);
        } else {
          DataSources.findOneAndUpdate({data_id: newDataSource.data_id}, {
            $push: { visuals: slug }
          },function(err)
          {
            if(err){
              console.log(new Date()+" Error  on Adding Visual to dataSource: "+err);
            }
          });
        }
      });
      if(created === 0) {
        console.log(new Date()+ " Visual Created: returning slug: "+slug+" keeping generating stuff");
        context.responseObj ={
          status: "ok",
          id: newDataSource._id,
          slug: slug
        };
        returnDataLogResponse(context);
        //save visual as current for the user, create user if he doenst exist yet
        let userid = context.botparams.session_id;
        Users.findOneAndUpdate({user_id: userid}, // find a document with that filter
          {  user_id : userid,
            current_data_id : newDataSource.data_id,
            current_slug : slug}, // document to insert when nothing was found
          {upsert: true, new: true}, // options
          function (err) { // callback
            if (err) {
              console.log(new Date()+": Error on User Save "+err);
            }
          }
        );
      }
      created++;
      if(created < toCreateArray.length) {
        createVisualRecursive(context,newDataSource,created,toCreateArray);
      } else {
        console.log("done creating visuals");
      }
    } else {
      console.log(new Date()+" on request to create visual on 23 degree"+error);
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

generateMapQueryObject = function(datasource, valueField,entityField,districtCode) {
  let chartRequestOBJ = {
    "meta": {
      "name": datasource.dataDesc.name + " "+valueField,
      "sourceOrganization": datasource.dataDesc.publisher,
      "source": datasource.dataDesc.publisher,
      "description": datasource.dataDesc.description,
      "publisher_name": datasource.dataDesc.publisher,
      "publisher_homepage": datasource.dataDesc.portal,
      "publisher_contact": "EMAIL ADRESS OF PUBLISHER",
      "publisher_tags": ["City of Vienna", "Demographie", "Population"],
      "accessUrl": "/api/data/",
      "accessFormat": "json",
      "frequency": "Probably no Data Update",
      "license": "OpenData",
      "citation": "INSERT CITATION IF AVAILABLE",
      "isoField": districtCode,
      "entityField": entityField,
      "timeField": datasource.timeField,
      "timeDimension": datasource.timeDimension,
      "timeUnit": "year",
      "valueField": valueField,
      "unit": "Value:",
      "colors": ["#ffc971", "#ffb627", "#ff9505", "#e2711d", "#cc5803"],
      "legendtitles": ["low", "med-low", "med", "med-high", "high"],
      "tooltip": [{"label": valueField, "field": "data:"+valueField }],
      "theme": "light"
    },
    "parameters": {
      "source": "manual",
      "provider": "reboting",
      "layer": "choropleth",
      "data_id": datasource.data_id
    }
  };
  return chartRequestOBJ;
};

generateBarChartQueryObject = function (datasource, valueField,entityField) {
  let chartRequestOBJ = {
    "meta": {
      "name": datasource.dataDesc.name + " "+valueField,
      "sourceOrganization": datasource.dataDesc.publisher,
      "source": datasource.dataDesc.publisher,
      "description": datasource.dataDesc.description,
      "publisher_name": datasource.dataDesc.publisher,
      "publisher_homepage": datasource.dataDesc.portal,
      "publisher_contact": "EMAIL ADRESS OF PUBLISHER",
      "publisher_tags": ["City of Vienna", "Demographie", "Population"],
      "accessUrl": "/api/data/",
      "accessFormat": "json",
      "frequency": "Probably no Data Update",
      "license": "OpenData",
      "citation": "INSERT CITATION IF AVAILABLE",
      "isoField": "null",
      "entityField": entityField,
      "timeField": datasource.timeField,
      "timeDimension": datasource.timeDimension,
      "timeUnit": "year",
      "valueField": valueField,
      "unit": "Value:",
      "colors": ["#ffc971", "#ffb627", "#ff9505", "#e2711d", "#cc5803"],
      "legendtitles": ["low", "med-low", "med", "med-high", "high"],
      "tooltip": [{"label": valueField, "field": "data:"+valueField }],
      "theme": "light"
    },
    "parameters": {
      "source": "manual",
      "provider": "reboting",
      "layer": "chart",
      "data_id": datasource.data_id
    }
  };
  return chartRequestOBJ;
};
