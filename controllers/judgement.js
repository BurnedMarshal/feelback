var User = require('../models/user');
const CONFIG = require('../conf/config');
const db = require('seraph')({
    server: CONFIG.database,
    user: CONFIG.username,
    pass: CONFIG.password});

/**
 * Calculate judgement from current user to another
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 */
function judgeScore(req, res, next) {
    User.findById(req.user, function(err, user) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        var cypher = `START a=node(${req.user}), b=node(${req.userId}) ` +
        "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(b) " +
        "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 2 AND r2.average >=2 " +
        "WITH p, relationships(p) as rcoll " +
        "RETURN p, reduce(judge=5, x in rcoll| judge * x.average/5) as judgement " +
        "UNION " +
        `START a=node(${req.user}), b=node(${req.userId}) ` +
        "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(b) " +
        "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 2 AND r2.average >=2 AND r3.average >=2 " +
        "WITH p, relationships(p) as rcoll " +
        "RETURN p, reduce(judge=5, x in rcoll| judge * x.average/5) as judgement " +
        "UNION " +
        `START a=node(${req.user}), b=node(${req.userId}) ` +
        "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(x3)-[r4:judge]->(b) " +
        "WHERE NOT((a)-[:judge]->(b)) AND NOT(x1.id = x3.id) AND r1.average >= 2 AND r2.average >= 2 AND r3.average >= 2 AND r4.average >= 2 " +
        "WITH p, relationships(p) as rcoll " +
        "RETURN p, reduce(judge=5, x in rcoll| judge * x.average/5) as judgement";
        db.query(cypher, {}, function(err, results) {
            'use strict';
            if (err) {
                return res.status(500).send({message: "Internal server Error"});
            }
            var total = 0;
            for (let i = 0; i < results.length; i++) {
                total += results[i].judgement;
            }
            total /= results.length;
            req.judgement = total;
            next();
        });
    });
}

module.exports.judgeScore = judgeScore;
