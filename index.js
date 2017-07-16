#!/usr/bin/env node

'use strict';

require('dotenv').config()

var SwaggerExpress = require('swagger-express-mw');
var app = require('./app');
var debug = require('debug')('ctl-user-svc:index');
var http = require('http');
var jsyaml = require('js-yaml');
var fs = require('fs');

var config = {
  appRoot: __dirname
};

var port = normalizePort(process.env.PORT || '3000');

// The Swagger document (require it, build it programmatically, 
// fetch it from a URL, ...)
var spec = fs.readFileSync(__dirname + '/api/swagger/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

app.get('/api-docs', (req, res) => {
  res.send(swaggerDoc);
});

SwaggerExpress.create(config, function (err, swaggerExpress) {
  if (err) {
    throw err;
  }
  swaggerExpress.register(app);
  /*
   // Same as line above
   app.use(swaggerExpress.middleware());
   */
  var server = app.listen(port);
  server.on('error', onError);
  server.on('listening', () => {
    onListening(server);
  });
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use!');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server) {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app; // for testing