var uuid = require('node-uuid');
const CONFIG = require('../conf/config');
const db = require('seraph')({
    server: CONFIG.database,
    user: CONFIG.username,
    pass: CONFIG.password});

module.exports = {
    findById: find,
    save: save,
    where: where,
    delete: del,
    judge: judge,
    judgements: judgements
};

/**
 * Retrieve User node from Neo4j using node.id
 * @param  {[Integer]}   userId User node id
 * @param  {Function} next   [callback]
 */
function find(userId, next) {
    console.log('USER_ID: ', userId);
    db.find({uuid: userId}, false, 'User', function(err, users) {
        console.log('Cosa ho trovato? --->', users);
        if (users && users.length === 1) {
            next(err, users[0]);
        } else {
            next(err, null); // User not found
        }
    });
}

/**
 * Retrieve User node from Neo4j using node.id
 * @param  {[Object]}   query User node query predicate
 * @param  {Function} next   [callback]
 */
function where(query, next) {
    db.find(query, false, 'User', function(err, users) {
        next(err, users);
    });
}

/**
 * Create new User node in neo4j database
 * @param  {[type]}   user User Object
 * @param  {Function} next callback
 */
function save(user, next) {
    if (user.id) {
        db.save(user, function(err, user) {
            next(err, user);
        });
    } else {
        // Create new node whit label User
        user.uuid = uuid.v1();
        db.save(user, 'User', function(err, user) {
            next(err, user);
        });
    }
}

/**
 * Delete existing User node in neo4j database. Force rel deletion.
 * @param  {[type]}   user User Object
 * @param  {Function} next callback
 */
function del(user, next) {
    db.delete(user, true, function(err) {
        next(err);
    });
}

/**
 * Create judge relationship between two users
 * @param  {[object]}   referee [description]
 * @param  {[object]}   judged  [description]
 * @param  {[object]}   value   [description]
 * @param  {Function} next    [callback]
 */
function judge(referee, judged, value, next) {
    var cypher = `START referee = node(${referee.id}), judged = node(${judged.id}) ` +
         "CREATE UNIQUE (referee)-[r:judge]->(judged) " +
         "RETURN r ";
    db.query(cypher, function(err, relationship) {
        'use strict';
        if (err) {
            next(err, relationship);
        } else {
            var average = 0;
            var size = 0;
            for (let val in value) {
                if (Object.hasOwnProperty.call(value, val)) {
                    average += value[val];
                    size++;
                }
            }
            average /= size;
            value.average = average;
            relationship[0].properties = value;
            db.rel.update(relationship[0], err => {
                next(err, relationship[0]);
            });
        }
    });
}

/**
 * Return judgements from one user to another
 * @param  {string}   startUserId [description]
 * @param  {string}   endUserId   [description]
 * @param  {Function} next        [description]
 */
function judgements(startUserId, endUserId, next) {
    var directCypher = `MATCH p=(a:User {uuid:'${startUserId}'})-[r:judge]->(b:User {uuid:'${endUserId}'}) ` +
    "RETURN r";
    db.query(directCypher, {}, function(err, results) {
        if (err) {
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results);
        } else {
            var cypher = `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(b) " +
            "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(b) " +
            "WHERE NOT((a)-[:judge]->(b)) AND r1.average >= 3 AND r2.average >=3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(x3)-[r4:judge]->(b) " +
            "WHERE NOT((a)-[:judge]->(b)) AND NOT(x1.id = x3.id) AND r1.average >= 3 AND r2.average >= 3 AND r3.average >= 3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement ";
            db.query(cypher, {}, function(err, results) {
                'use strict';
                if (err) {
                    return next(err, null);
                }
                var total = {};
                var weight = {};
                for (let i = 0; i < results.length; i++) {
                    if (i === 0) {
                        for (let key in results[0].judgement) {
                            if (Object.hasOwnProperty.call(results[0].judgement, key)) {
                                total[key] = results[0].judgement[key] * (results[0].judgement[key] / 5);
                                weight[key] = (results[0].judgement[key] / 5);
                            }
                        }
                        total = results[0].judgement;
                    } else {
                        for (let key in total) {
                            if (Object.hasOwnProperty.call(total, key)) {
                                total[key] += results[i].judgement[key] * (results[i].judgement[key] / 5);
                                weight[key] = (results[i].judgement[key] / 5);
                            }
                        }
                    }
                }
                for (let key in total) {
                    if (Object.hasOwnProperty.call(total, key))
                        total[key] /= weight[key];
                }
                next(null, total);
            });
        }
    });
}
