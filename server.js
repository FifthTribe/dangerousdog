process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app = express();
var Parse = require('parse/node');

// Access the body posts content
app.use(bodyParser.urlencoded({ extended: false }));

// Check if we are on on AWS or not
if (process.env.AWS == null || !process.env.AWS) {
  // get the process environment variables for localhost
  var config = require('./config');
}

// define the port
var port = process.env.PORT || 8080;

// Controllers
var getdogs = require('./controllers/getdogs');

app.get('/')
app.get('/getdogs',getdogs.pullData);

app.listen(port);
