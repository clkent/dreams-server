'use strict';

const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');

const { User } = require('../user/user.model');
const { JWT_SECRET } = require('../config');

// The LocalStrategy gets used while trying to access an Endpoint using a User + Password combination
const localStrategy = new LocalStrategy((username, password, done) => {
  let user;
  //Verify the username exists
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        // If user is not found on the database, reject promise with an error.
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      // Compare the user's password against the stored password hash by running it against the same algorithm.
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        // If password doesn't match the stored password hash, reject promise with an error.
        return Promise.reject({
          reason: 'LoginError',
          message: 'Incorrect username or password'
        });
      }
      // If authentication is successful, execute the passportVerify callback correctly.
      return done(null, user);
    })
    .catch(err => {
      // If an error ocurred at any stage during the process, execute the passportVerify callback correctly.
      if (err.reason === 'LoginError') {
        return done(null, false, err.message);
      }
      return done(err, false);
    });
});

// The JwtStrategy gets used while trying to access an Endpoint using a JSON Web Token
const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    algorithms: ['HS256']
  },
  (token, done) => {
    done(null, token.user);
  }
);

passport.use(localStrategy);
passport.use(jwtStrategy);

const localPassportMiddleware = passport.authenticate('local', {
  session: false
});
const jwtPassportMiddleware = passport.authenticate('jwt', { session: false });

module.exports = {
  localStrategy,
  jwtStrategy,
  localPassportMiddleware,
  jwtPassportMiddleware
};
