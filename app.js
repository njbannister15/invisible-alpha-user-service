var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var version = require('version-healthcheck');
var app = express();

// use logger if not in test mode.
if (app.get('env') !== 'test') 
  app.use(logger('dev'));

app.set('x-powered-by', false);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/version', version);

module.exports = app;