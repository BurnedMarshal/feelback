var express = require('express');
var router = express.Router();

/* GET index page angular. */
/* router.get('/', function(req, res, next) {
    res.render('index', {});
});*/

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

module.exports = router;
