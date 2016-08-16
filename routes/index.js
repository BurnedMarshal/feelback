var express = require('express');
var router = express.Router();

/* GET index page angular. */
router.get('/', function(req, res, next) {
    res.render('index', {});
});

router.get('/home', function(req, res, next) {
    res.render('home', {});
});

module.exports = router;
