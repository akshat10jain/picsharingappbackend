
const jwt = require('jsonwebtoken')
const configConsts = require('../config/constants');
const User = require('../Models/User')
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

exports.sign = (payload) => {
    return jwt.sign(payload, process.env.TOKEN_SECRET, {
        expiresIn: configConsts.AUTH_TOKEN_EXPIRY_HOURS + 'h'
    });
};

exports.validate = function (passport) {
    var opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.TOKEN_SECRET;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        User.findById(jwt_payload._id, function (err, user) {
            if (err) {
                console.log(err)
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
}