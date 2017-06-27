var debug = require('debug')('users');

var express = require('express');
var router = express.Router();

var jwt = require('jsonwebtoken');

var opts = {
    secretOrKey: process.env.SECRET
}

var User = require('../schema/user');
var bcrypt = require('bcrypt');

router.post('/authenticate', (req, res, next) => {
    var query = User.where({ email: req.body.email });
    query.findOne((err, user) => {
        if (err) {
            return res.status(500).json({ error: "Error in Mongo Query" });
        }
        if (!user) {
            return res.status(401).json({ error: "No Such User Exists" });
        }
        bcrypt.compare(req.body.password, user.password, function(err, result) {
            if (err) {
                return res.status(500).send({ error: "Error in BCrypt compare" });
            } else if (result == true) {
                var payload = {
                    id: user.id,
                    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Signing a token with 1 hour of expiration
                    data: {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role
                    }
                };
                var token = jwt.sign(payload, opts.secretOrKey);
                return res.json({ message: "ok", token: token });
            } else {
                return res.status(401).json({ error: "Bad Password" });
            }
        });
    });
});

router.post('/signup', (req, res, next) => {
    var query = User.where({ email: req.body.email });
    query.findOne((err, user) => {
        if (err) {
            return res.status(500).json({ error: "Error in Mongo Query" });
        }
        if (user) {
            return res.status(409).json({ error: "User Exists" });
        }

        bcrypt.hash(req.body.password, 4, function(err, hash) {
            if (err) {
                return res.status(500).send({ error: "Error in BCrypt hash" });
            }
            req.body.password = hash;
            var user = new User(req.body);
            user.save((err, user) => {
                if (err) {
                    return res.status(500).json({ error: "Error Saving to Mongo" });
                }
                return res.send(user);
            });

        });
    });
});

module.exports = router;