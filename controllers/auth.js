const config = require('../conf/config');
var jwt = require('jwt-simple');
var moment = require('moment');

/**
 * Login Required Middleware
 * @param  {[type]}   req  request
 * @param  {[type]}   res  response
 * @param  {Function} next callback
 * @return {[type]} http response
 */
function ensureAuthenticated(req, res, next) {
    if (!req.header('Authorization')) {
        return res.status(401).json({message: 'Please make sure your request has an Authorization header'});
    }
    var token = req.header('Authorization').split(' ')[1];

    var payload = null;
    try {
        payload = jwt.decode(token, config.secret);
    } catch (err) {
        return res.status(401).json({message: err.message});
    }

    if (payload.exp <= moment().unix()) {
        return res.status(401).json({message: 'Token has expired'});
    }
    req.user = payload.sub;
    next();
}

module.exports.ensureAuthenticated = ensureAuthenticated;
