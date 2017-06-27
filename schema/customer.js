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
    firstName: String,
    lastName: String,
    email: String,
    organizationId: mongoose.Schema.Types.ObjectId,
    password: String,
    phone: String,
    roles: { type: Array, default: ["ADMIN"] },
});

var Customer = mongoose.model('Customer', userShema);

module.exports = Customer;