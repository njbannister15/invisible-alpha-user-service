'use strict';

var url = require('url');
var UsersService = require('./UsersService');
var AuthorizationGateway = require('../../lib/AuthorizationGateway');

let usersService = new UsersService();
let authorization = new AuthorizationGateway();

module.exports.authenticate = (req, res, next) => {
  usersService.authenticate(req, res, next);
};

module.exports.signup = (req, res, next) => {
  usersService.signup(req, res, next);
};

module.exports.getUsers = (req, res, next) => {
  authorization.authorize(req, res, usersService.getUsers);
};

module.exports.getUser = (req, res, next) => {
  authorization.authorize(req, res, usersService.getUser);
};