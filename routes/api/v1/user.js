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

module.exports = router;
