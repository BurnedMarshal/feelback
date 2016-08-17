var express = require('express');
var router = express.Router();
var request = require('request');
const User = require('../models/user');
const CONFIG = require('../conf/config');
var jwt = require('jwt-simple');
var moment = require('moment');

/* GET index page angular. */
/* router.get('/', function(req, res, next) {
    res.render('index', {});
});*/

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
    var payload = {
        sub: user._id,
        iat: moment().unix(),
        exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, CONFIG.secret);
}

router.get('/error', function(req, res, next) {
    res.render('error', {});
});

router.get('/home', function(req, res, next) {
    res.render('templates/home', {});
});

router.get('/login', function(req, res, next) {
    res.render('templates/login', {});
});

/* GET index page angular. */
router.get('/:lang?/:route?', function(req, res, next) {
    res.render('index', {});
});

router.post('/auth/facebook', function(req, res) {
    var fields = ['id', 'email', 'first_name', 'last_name', 'name', 'gender', 'friends', 'birthday', 'hometown', 'location', 'work'];
    var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
    var params = {
        code: req.body.code,
        client_id: req.body.clientId,
        client_secret: CONFIG.secret,
        redirect_uri: req.body.redirectUri
    };

  // Step 1. Exchange authorization code for access token.
    request.get({url: accessTokenUrl, qs: params, json: true}, function(err, response, accessToken) {
        if (response.statusCode !== 200) {
            return res.status(500).send({message: accessToken.error.message});
        }

    // Step 2. Retrieve profile information about the current user.
        request.get({url: graphApiUrl, qs: accessToken, json: true}, function(err, response, profile) {
            if (response.statusCode !== 200) {
                return res.status(500).send({message: profile.error.message});
            }
            if (req.header('Authorization')) {
                User.where({id: profile.id}, function(err, existingUser) {
                    if (existingUser) {
                        return res.status(409).send({message: 'There is already a Facebook account that belongs to you'});
                    }
                    var token = req.header('Authorization').split(' ')[1];
                    var payload = jwt.decode(token, CONFIG.secret);
                    console.log(payload);
                    return res.status(500).send({message: 'Function not supported'});
                    /* User.findById(payload.sub, function(err, user) {
                        if (!user) {
                            return res.status(400).send({message: 'User not found'});
                        }
                        user.facebook = profile.id;
                        user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
                        user.displayName = user.displayName || profile.name;
                        user.save(function() {
                            var token = createJWT(user);
                            res.send({token: token});
                        });
                    });*/
                });
            } else {
                // Step 3. Create a new user account or return an existing one.
                User.where({facebook_id: profile.id}, function(err, existingUser) {
                    if (err) {
                        return res.status(500).send({message: err});
                    }
                    if (existingUser.length > 0) {
                        // TODO: update user account information from facebook
                        var token = createJWT(existingUser[0]);
                        return res.send({token: token});
                    }
                    var user = profile;
                    user.facebook_id = profile.id;
                    user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                    user.friends = JSON.stringify(user.friends);
                    user.work = JSON.stringify(user.work);
                    user.hometown = JSON.stringify(user.hometown);
                    user.location = JSON.stringify(user.location);
                    delete user.id;
                    User.save(user, function(err, savedUser) {
                        if (err) {
                            return res.status(500).send({message: err});
                        }
                        var token = createJWT(savedUser);
                        res.send({token: token});
                    });
                });
            }
        });
    });
});

module.exports = router;
