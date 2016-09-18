var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('templates/user', {});
});

router.get('/profile', function(req, res, next) {
    res.render('templates/profile', {});
});

module.exports = router;
