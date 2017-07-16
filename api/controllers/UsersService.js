var debug = require('debug')('users'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  config = require('../../config'),
  User = require('../../schema/User'),
  bcrypt = require('bcrypt'),
  hal = require('hal');

const uuidv4 = require('uuid/v4');

var opts = {
  userSecret: process.env.USER_SECRET,
  authSecret: process.env.AUTH_SECRET
}

class UsersService {

  authenticate(req, res) {
    let query = User.where({email: req.body.email});
    query.findOne((err, user) => {
      if (err) {
        return res
          .status(500)
          .json({error: "Error in Mongo Query"});
      }
      if (!user) {
        return res
          .status(401)
          .json({error: "No Such User Exists"});
      }
      bcrypt
        .compare(req.body.password, user.password, function (err, result) {
          if (err) {
            return res
              .status(500)
              .send({error: "Error in BCrypt compare"});
          } else if (result == true) {

            let token = jwt.sign({
              data: {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
              }
            }, opts.userSecret, {
              audience: `${user.id}`,
              issuer: config.issuer,
              expiresIn: '1h'
            });

            
            let jti = uuidv4();
            let access = jwt.sign({
              scope: user.roles
            }, opts.authSecret, {
              issuer: config.issuer,
              audience: config.audience,
              expiresIn: '1h',
              keyid: jti,
              subject: user.email
            });
            return res.json({message: "ok", id_token: token, access_token: access});
          } else {
            return res
              .status(401)
              .json({error: "Bad Password"});
          }
        });
    });
  }

  signup(req, res) {
    let query = User.where({email: req.body.email});
    query.findOne((err, user) => {
      if (err) {
        return res
          .status(500)
          .json({error: "Error in Mongo Query"});
      }
      
      if (user) {
        return res
          .status(409)
          .json({error: "User Exists"});
      }

      bcrypt
        .hash(req.body.password, 4, function (err, hash) {
          if (err) {
            return res
              .status(500)
              .send({error: "Error in BCrypt hash"});
          }
          req.body.password = hash;
          let user = new User(req.body);
          user.save((err, user) => {
            if (err) {
              return res
                .status(500)
                .json({error: "Error Saving to Mongo"});
            }
            return res.send(user);
          });

        });
    });
  }

  getUsers(req, res) {
    let userStream = User
      .find()
      .cursor();

    let usersCollection = new hal.Resource(undefined, req.path);
    let embedded = [];

    userStream.on('data', (doc) => {
      let orig = doc.toObject();
      let path = req.path + '/' + orig._id;
      delete orig.password;
      embedded.push(new hal.Resource(orig, path));
    }).on('close', () => {
      usersCollection.embed("users", embedded);
      return res.send(usersCollection);
    });
  }

  getUser(req, res) {
    // Swagger-tools has been completely replaced in this release by the new Sway
    // library. Quite annoying to get values
    let userId = req
      .swagger
      .operation
      .getParameter("userId")
      .getValue(req)
      .value;

    let oper = req.swagger.operation;

    User.findById(userId, (err, found) => {
      if (err) {
        return res
          .status(500)
          .json({error: err.message});
      }
      let orig = found.toObject();
      delete orig.password;
      let user = new hal.Resource(orig, req.path);
      return res.send(user);
    })

  }
}

module.exports = UsersService;