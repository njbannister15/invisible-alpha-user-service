var jwt = require('jsonwebtoken');

var opts = {
  userSecret: process.env.USER_SECRET,
  authSecret: process.env.AUTH_SECRET
}

class AuthorizationGateway {
  /**
   * 
   * @param {*} roles 
   */
  constructor(roles) {
    this.roles = roles;
    this.authorize = this
      .authorize
      .bind(this);    
  }

  /**
   *
   * @param {*} authToken
   * @param {*} callback
   */
  verifyToken(authToken, callback) {
    if (authToken) {
      let split = authToken.split(" ");
      if (split.length === 2 && (split[0] === 'JWT' || split[0] === 'Bearer')) {
        try {
          let verified = jwt.verify(split[1], opts.authSecret);
          return callback(null, {
            token: split[1],
            verified
          });
        } catch (err) {
          return callback(err);
        }
      } else {
        return callback(new Error("Authorization Header Required in the form 'Authorization: JWT|Bearer {token}'"));
      }
    } else {
      return callback(new Error("Authorization Header Required"));
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res the response object.
   * @param {*} next
   */
  authorize(req, res, next) {
    this.verifyToken(req.get('Authorization'), (err, result) => {
      if (err) {
        return res
          .status(401)
          .send({error: err.message});
      }

      let verified = result.verified;
      // for now we only support admin roles
      if (verified.scope[0] == 'ADMIN') {
        return next(req, res);
      } else {
        return res
          .status(401)
          .send({error: "Insufficient permissions"});
      }
    });
  }
}

module.exports = AuthorizationGateway;