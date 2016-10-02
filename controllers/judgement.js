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

module.exports.judgeScore = judgeScore;
module.exports.judge = judge;
module.exports.directJudgement = directJudgement;
