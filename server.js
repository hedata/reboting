const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const logger = require('winston');

//db config
require('./server/db/db');


//  Bring in the authenticated routes
var routesApi = require('./server/routes/index');


const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({ 
  extended: false,
  limit: '50mb'
}));

app.use(express.static(path.join(__dirname, 'dist')));



app.use('/api', routesApi);


app.get('*', (req, res) => {
    console.log(req.params);
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port',port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Server running on ${port}`));
