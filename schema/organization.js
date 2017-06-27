var mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_DB);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    // we're connected!
});

var userShema = mongoose.Schema({
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now },
    name: String,
    address: String,
    phone: String,
    email: String
});

var Organization = mongoose.model('Organization', userShema);

module.exports = Organization;