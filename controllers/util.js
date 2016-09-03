/**
 * [baypassLogin description]
 * @param  {Object}   req  [description]
 * @param  {Object}   res  [description]
 * @param  {Function} next [description]
 * @return {function}           response on bad request status
 */
function bypassLogin(req, res, next) {
    if (!req.params.referee || !req.params.judged) {
        return res.send(400).json({message: "Bad request"});
    }
    req.user = req.params.referee;
    req.params.userId = req.params.judged;
    next();
}

module.exports.bypassLogin = bypassLogin;
