var express = require('express');
var router = express.Router();
const auth = require('../../../controllers/auth');
const judgement = require('../../../controllers/judgement');
const util = require('../../../controllers/util');

router.get('/users/:userId', auth.ensureAuthenticated, judgement.judgeScore, function(req, res) {
    res.status(200).json({judgement: req.judgement});
});

router.post('/users/:userId', auth.ensureAuthenticated, judgement.judge, function(req, res) {
    res.status(200).json({judgement: req.judgement});
});

router.delete('/users/:userId', auth.ensureAuthenticated, judgement.deleteJudgement, function(req, res) {
    res.status(200).json({message: 'ok'});
});

router.get('/:userId', auth.ensureAuthenticated, judgement.directJudgement, function(req, res) {
    res.status(200).json({judgement: req.judgement});
});

router.get('/:referee/:judged', util.bypassLogin, judgement.judgeScore, function(req, res) {
    res.status(200).json({judgement: req.judgement});
});

router.get('/:referee/:judged/extended', util.bypassLogin, judgement.judgeScoreExtended, function(req, res) {
    res.status(200).json({judgements: req.judgements});
});

module.exports = router;
