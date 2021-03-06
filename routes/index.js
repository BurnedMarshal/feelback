var express = require('express');
var router = express.Router();

router.get('/error', function(req, res, next) {
    res.render('error', {});
});

router.get('/not-found', function(req, res, next) {
    res.render('404', {});
});

router.get('/home', function(req, res, next) {
    res.render('templates/home', {});
});

router.get('/login', function(req, res, next) {
    res.render('templates/login', {});
});

/* GET index page angular. */
router.get('/:lang?/:route?/:id?/:action?', function(req, res, next) {
    res.render('index', {});
});

module.exports = router;
