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
    var directCypher = `START a=node(${req.user}), b=node(${req.userId}) ` +
      "MATCH p=(a)-[r:judge]->(b) " +
      "RETURN r";
    db.query(directCypher, {}, function(err, results) {
        if (err) {
            return res.status(500).send({message: 'Internal server error'});
        }
        if (results && results.r) {
            req.judgement = results.r;
        } else {
            var cypher = `OPTIONAL MATCH (a:User {uuid:'${req.user}'}), (b:User {uuid:'${req.userId}'}) WITH a, b ` +
              "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(b) " +
              "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 3 " +
              "WITH p, relationships(p) as rcoll " +
              "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
              "UNION " +
              `OPTIONAL MATCH (a:User {uuid:'${req.user}'}), (b:User {uuid:'${req.userId}'}) WITH a, b ` +
              "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(b) " +
              "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 3 AND r2.average >=3 " +
              "WITH p, relationships(p) as rcoll " +
              "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
              "UNION " +
              `OPTIONAL MATCH (a:User {uuid:'${req.user}'}), (b:User {uuid:'${req.userId}'}) WITH a, b ` +
              "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(x3)-[r4:judge]->(b) " +
              "WHERE NOT((a)-[:judge]->(b)) AND NOT(x1.id = x3.id) AND r1.average >= 3 AND r2.average >= 3 AND r3.average >= 3" +
              "WITH p, relationships(p) as rcoll " +
              "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement ";
            db.query(cypher, {}, function(err, results) {
                'use strict';
                if (err) {
                    return res.status(500).send({message: "Internal server Error"});
                }
                var total = {};
                for (let i = 0; i < results.length; i++) {
                    if (i === 0) {
                        total = results[0].judgement;
                    } else {
                        for (let key in total) {
                            if (Object.hasOwnProperty.call(total, key))
                                total[key] += results[i][key];
                        }
                    }
                }
                for (let key in total) {
                    if (Object.hasOwnProperty.call(total, key))
                        total[key] /= results.length;
                }
                req.judgement = total;
                next();
            });
        }
    });
}

module.exports.judgeScore = judgeScore;
