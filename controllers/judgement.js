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

module.exports.judgeScore = judgeScore;
