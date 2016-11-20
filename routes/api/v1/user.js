var express = require('express');
var router = express.Router();
const auth = require('../../../controllers/auth');
const User = require('../../../models/user');

router.get('/me', auth.ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        res.send(user);
    });
});

router.get('/network', auth.ensureAuthenticated, function(req, res) {
    User.network(req.user, function(err, network) {
        if (err) {
            return res.status(500).send({message: 'Internal server error', error: err});
        }
        res.send(network);
    });
});

router.get('/search', function(req, res) {
    if (req.query.name) {
        User.search(req.query.name, function(err, users) {
            'use strict';
            if (err) return res.status(500).send({message: 'Internal server error'});
            var usersFound = [];
            if (users) {
                for (let i = 0; i < users.length; i++) {
                    let user = {
                        name: users[i].name,
                        uuid: users[i].uuid,
                        picture: users[i].picture
                    };
                    usersFound.push(user);
                }
                res.status(200).send(usersFound);
            } else {
                res.status(404).send({message: 'User not found'});
            }
        });
    }
});

router.get('/ext_search', auth.ensureAuthenticated, function(req, res) {
  var params = {};
  if(req.query.location) params.location = req.query.location;
  if(req.query.work) params.work = req.query.work;

  if(req.query.minAge && req.query.minAge > 0) {
    var today = new Date();
    params.minAge = new Date(today.getFullYear()-req.query.minAge, today.getMonth()+1, today.getDate());
  }
  if(req.query.maxAge && req.query.maxAge > 0) {
    var today = new Date();
    params.maxAge = new Date(today.getFullYear()-req.query.maxAge, today.getMonth()+1, today.getDate());
  }

  if(Object.keys(params).length === 0) return res.status(400).send({message: "Missing required params in query"});

  User.extendedSearch(req.user, params, function(err, users) {
    'use strict';
    if (err) return res.status(500).send({message: 'Internal server error'});
    var usersFound = [];
    if (users) {
        for (let i = 0; i < users.length; i++) {
            let user = {
                name: users[i].name,
                uuid: users[i].uuid,
                picture: users[i].picture
            };
            usersFound.push(user);
        }
        res.status(200).send(usersFound);
    } else {
        res.status(404).send({message: 'User not found'});
    }
  });
});


router.get('/recommendedPeople', function(req, res) {
    if (req.query.name) {
        User.recommendedPeople(req.query.name, function(err, users) {
            'use strict';
            if (err) return res.status(500).send({message: 'Internal server error'});
            var usersFound = [];
            if (users) {
                for (let i = 0; i < users.length; i++) {
                    let user = {
                        name: users[i].name,
                        uuid: users[i].uuid,
                        location: users[i].location,
                        picture: users[i].picture
                    };
                    usersFound.push(user);
                }
                res.status(200).send(usersFound);
            } else {
                res.status(404).send({message: 'User not found'});
            }
        });
    }
});




router.get('/:id', function(req, res) {
    console.log(req.params.id);
    User.findById(req.params.id, function(err, user) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        if (user) {
            res.send(user);
        } else {
            res.status(404).send({message: 'User not found'});
        }
    });
});

router.get('/:id/trustpeople/', function(req, res) {
    User.trustpeople(req.params.id, function(err, users) {
        'use strict';
        if (err) return res.status(500).send({message: 'Internal server error'});
        var usersFound = [];
        if (users) {
            for (let i = 0; i < users.length; i++) {
                let user = {
                    name: users[i].name,
                    uuid: users[i].uuid,
                    location: users[i].location,
                    picture: users[i].picture
                };
                usersFound.push(user);
            }
            res.status(200).send(usersFound);
        } else {
            res.status(404).send({message: 'User not found'});
        }
    });
});


router.get('/:id/stats/', function(req, res) {
    User.networkCount(req.params.id, function(err, stats) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        if (stats) {
            res.send(stats);
        } else {
            res.status(404).send({message: 'User not found'});
        }
    });
});

router.post('/:id/view/', function(req, res) {
    User.addView(req.params.id, function(err, stats) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        if (stats) {
            res.status(200).send({message: 'OK'});
        } else {
            res.status(404).send({message: 'User not found'});
        }
    });
});

module.exports = router;
