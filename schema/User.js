var config = require('config');
var mongoose = require('mongoose');
/*
var MongoClient = require('mongodb').MongoClient;

MongoClient.connect('mongodb://' + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB);

mongoose.connect('mongodb://' + process.env.MONGO_USER + ":" + process.env.MONGO_PASSWORD + '@' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB);
*/
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB, {useMongoClient: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // console.log("we're connected!");
});

var userShema = mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  roles: {
    type: Array,
    default: ["ADMIN"]
  }
});

var User = mongoose.model('User', userShema);

module.exports = User;