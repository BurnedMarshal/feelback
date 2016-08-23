var express = require('express');
var router = express.Router();
const auth = require('../../../controllers/auth');
const judgement = require('../../../controllers/judgement');

router.get('/users/:userId', auth.ensureAuthenticated, judgement.judgeScore, function(req, res) {
    res.status(200).json({judgement: req.judgement});
});

module.exports = router;
