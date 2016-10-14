var User = require('../models/user');

/**
 * Calculate judgement from current user to another
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 */
function judgeScore(req, res, next) {
    User.judgements(req.user, req.params.userId, function(err, judgement) {
        if (err) {
            return res.status(500).send({message: 'Internal Server Error', error: err});
        }
        req.judgement = judgement;
        next();
    });
}

/**
 * Calculate extended judgements path from current user to another
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 */
function judgeScoreExtended(req, res, next) {
    User.judgementsExtended(req.user, req.params.userId, function(err, judgements) {
        if (err) {
            return res.status(500).send({message: 'Internal Server Error', error: err});
        }
        req.judgements = judgements;
        next();
    });
}

/**
 * Update or create judgement from referee to judged user
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 */
function judge(req, res, next) {
    User.findById(req.user, function(err, referee) {
        if (err) return res.status(404).send({message: 'Referee not found', error: err});
        User.findById(req.params.userId, function(errJ, judged) {
            if (errJ) return res.status(404).send({message: 'Referee not found', error: errJ});
            User.judge(referee, judged, req.body.judgement, function(err, judgement) {
                if (err) return res.status(500).send({message: 'Internal Server Error', error: err});
                req.judgement = judgement.properties;
                next();
            });
        });
    });
}

/**
 * [personalJudgement description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {function} next callback function
 */
function directJudgement(req, res, next) {
    User.getJudgement(req.user, req.params.userId, function(err, judgement) {
        if (err) return res.status(500).send({message: 'Internal Server Error', error: err});
        req.judgement = judgement;
        next();
    });
}

/**
 * [deleteJudgement description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 */
function deleteJudgement(req, res, next) {
    User.deleteJudgement(req.user, req.params.userId, function(err) {
        if (err) return res.status(500).send({message: 'Internal Server Error', error: err});
        next();
    });
}

module.exports.judgeScore = judgeScore;
module.exports.judge = judge;
module.exports.directJudgement = directJudgement;
module.exports.deleteJudgement = deleteJudgement;
module.exports.judgeScoreExtended = judgeScoreExtended;
