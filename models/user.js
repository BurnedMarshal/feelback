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
    judgements: judgements,
    judgementsExtended: judgementsExtended,
    getJudgement: getJudgement,
    network: network,
    search: search,
    extendedSearch: extendedSearch,
    recommendedPeople: recommendedPeople,
    deleteJudgement: deleteJudgement,
    networkCount: networkCount,
    addView: addView
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
    if (user.id !== undefined && user.id !== null) {
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
    console.log(value);
    db.query(cypher, function(err, relationship) {
        'use strict';
        if (err) {
            console.error(err);
            next(err, relationship);
        } else {
            var average = 0;
            var size = 0;
            for (let val in value) {
                if (Object.hasOwnProperty.call(value, val) && val !== 'type' && val !== 'average' && value[val] !== null) { // Support type value in judgement; bugfix null value
                    try {
                        value[val] = parseInt(value[val], 10); // Conversion from any to integer
                        average += value[val];
                        size++;
                    } catch (e) {
                        console.log('Error in parsing vote: ', e);
                        value[val] = null; // Skipping
                    }
                } else if (value[val] === null) {
                    delete value[val];
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
 * get direct judgement from referee to judged node
 * @param  {[string]}   refereeId uuid of referee node
 * @param  {[string]}   judgedId  uuid of judged node
 * @param  {Function} next      calback
 */
function getJudgement(refereeId, judgedId, next) {
    var directCypher = `MATCH p=(a:User {uuid:'${refereeId}'})-[r:judge]->(b:User {uuid:'${judgedId}'}) ` +
  "RETURN {average: r.average, etical: r.etical, personal: r.personal, professional: r.professional, type: r.type}";
    db.query(directCypher, {}, function(err, results) {
        if (err) {
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results[0]);
        } else {
            next(null, null);
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
    var cypher = `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(b) " +
            "WHERE NOT(a.uuid = b.uuid) AND NOT(a.uuid = x1.uuid) AND NOT(b.uuid = x1.uuid) AND r1.average >= 3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(b) " +
            "WHERE NOT(a.uuid = x1.uuid) AND NOT(x2.uuid = x1.uuid) AND NOT(x2.uuid = b.uuid) AND NOT(x2.uuid = a.uuid) AND NOT(b.uuid = x1.uuid) " +
            "AND r1.average >= 3 AND r2.average >=3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(x3)-[r4:judge]->(b) " +
            "WHERE NOT(x1.uuid = a.uuid) AND NOT(x1.uuid = x3.uuid) AND NOT(a.uuid = x2.uuid) AND NOT(x1.uuid = x2.uuid) " +
            "AND NOT(x1.uuid = b.uuid) AND NOT(x3.uuid = x2.uuid) AND NOT(x3.uuid = a.uuid) AND NOT(x3.uuid = x1.uuid) AND NOT(b.uuid = x2.uuid) AND NOT(b.uuid = x3.uuid) " +
            "AND r1.average >= 3 AND r2.average >= 3 AND r3.average >= 3 " +
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
            } else {
                for (let key in total) {
                    if (Object.hasOwnProperty.call(total, key)) {
                        total[key] += results[i].judgement[key] * (results[i].judgement[key] / 5);
                        weight[key] += (results[i].judgement[key] / 5);
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

/**
 * Return all path judgements from one user to another
 * @param  {string}   startUserId [description]
 * @param  {string}   endUserId   [description]
 * @param  {Function} next        [description]
 */
function judgementsExtended(startUserId, endUserId, next) {
    var cypher = `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(b) " +
            "WHERE NOT(a.uuid = b.uuid) AND NOT(a.uuid = x1.uuid) AND NOT(b.uuid = x1.uuid) AND r1.average >= 3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(b) " +
            "WHERE NOT(a.uuid = x1.uuid) AND NOT(x2.uuid = x1.uuid) AND NOT(x2.uuid = b.uuid) AND NOT(x2.uuid = a.uuid) AND NOT(b.uuid = x1.uuid) " +
            "AND r1.average >= 3 AND r2.average >=3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement " +
            "UNION " +
            `OPTIONAL MATCH (a:User {uuid:'${startUserId}'}), (b:User {uuid:'${endUserId}'}) WITH a, b ` +
            "MATCH p=(a)-[r1:judge]->(x1)-[r2:judge]->(x2)-[r3:judge]->(x3)-[r4:judge]->(b) " +
            "WHERE NOT(x1.uuid = a.uuid) AND NOT(x1.uuid = x3.uuid) AND NOT(a.uuid = x2.uuid) AND NOT(x1.uuid = x2.uuid) " +
            "AND NOT(x1.uuid = b.uuid) AND NOT(x3.uuid = x2.uuid) AND NOT(x3.uuid = a.uuid) AND NOT(x3.uuid = x1.uuid) AND NOT(b.uuid = x2.uuid) AND NOT(b.uuid = x3.uuid) " +
            "AND r1.average >= 3 AND r2.average >= 3 AND r3.average >= 3 " +
            "WITH p, relationships(p) as rcoll " +
            "RETURN p, {average: reduce(judge=5, x in rcoll| judge * x.average/5), etical: reduce(judge=5.0, x in rcoll| judge * x.etical/5), " +
            "personal: reduce(judge=5.0, x in rcoll| judge * x.personal/5), professional:reduce(judge=5.0, x in rcoll| judge * x.professional/5) } as judgement ";
    db.query(cypher, {}, function(err, results) {
        'use strict';
        if (err) {
            return next(err, null);
        }
        next(null, results);
    });
}

/**
 * Return all network for first level judge connection
 * @param  {[type]}   userId User uuid
 * @param  {Function} next   callback
 */
function network(userId, next) {
    var cypher = `MATCH (n:User)-[r:judge]->(l) WHERE n.uuid = '${userId}' AND  r.average>=3 return l ORDER By r.average DESC`;
    db.query(cypher, {}, function(err, results) {
        if (err) {
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results);
        } else {
            next(null, null);
        }
    });
}

/**
 * Search all user by name using regular expression
 * @param  {[type]}   name [description]
 * @param  {Function} next [description]
 */
function search(name, next) {
    var searchCypher = `MATCH (n:User) WHERE n.name =~ "(?i).*${name}.*" AND NOT(EXISTS(n.isTemp)) RETURN n`;
    db.query(searchCypher, {}, function(err, results) {
        if (err) {
            console.log(err);
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results);
        } else {
            next(null, null);
        }
    });
}

/**
 * Search all users in current user network
 * @param  {[type]}   userId [description]
 * @param  {[type]}   params [description]
 * @param  {Function} next   [description]
 */
function extendedSearch(userId, params, next) {
    var searchCypher = `MATCH (me:User)-[r:judge*1..4]->(n:User) WHERE me.uuid = '${userId}' `;
    var hasDate = false;
    for (var queryKey in params) {
        if (Object.hasOwnProperty.call(params, queryKey)) {
            if (typeof params[queryKey] === 'string') {
                searchCypher += `AND n.${queryKey} =~ "(?i).*${params[queryKey]}.*" `;
            } else if (!hasDate) {
                hasDate = true;
                searchCypher += 'AND EXISTS(n.birthday) ';
            }
        }
    }

    searchCypher += 'RETURN DISTINCT n';
    console.log(searchCypher);

    db.query(searchCypher, {}, function(err, results) {
        'use strict';
        if (err) {
            console.log(err);
            return next(err, null);
        }
        if (results && results.length > 0) {
            var checkDate = null;
            for (let i = 0; i < results.length; i++) {
                if (hasDate && params.minAge) {
                    checkDate = new Date(results[i].birthday.split('/')[2], results[i].birthday.split('/')[1], results[i].birthday.split('/')[0]);
                    console.log(checkDate);
                    console.log(params.minAge);
                    if (checkDate > params.minAge) {
                        results.splice(i, 1);
                        i--;
                        continue;
                    }
                }
                if (hasDate && params.maxAge) {
                    checkDate = new Date(results[i].birthday.split('/')[2], results[i].birthday.split('/')[1], results[i].birthday.split('/')[0]);
                    console.log(checkDate);
                    console.log(params.maxAge);
                    if (checkDate < params.maxAge) {
                        results.splice(i, 1);
                        i--;
                        continue;
                    }
                }
            }
            console.log(results);
            next(null, results);
        } else {
            next(null, null);
        }
    });
}

/**
 * Get 12  user by random.
 * TODO: fix to get real recommended people
 * @param  {[type]}   name [description]
 * @param  {Function} next [description]
 */
function recommendedPeople(name, next) {
    // var searchCypher = `MATCH (u:User) WITH u, rand() AS number RETURN u ORDER BY number LIMIT 12`;
    var searchCypher = `MATCH (u:User) RETURN u ORDER BY u.name LIMIT 100`;
    db.query(searchCypher, {}, function(err, results) {
        if (err) {
            console.log(err);
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results);
        } else {
            next(null, null);
        }
    });
}

/**
 * Delete direct judgement from a referee to a judged user
 * @param  {[type]}   refereeId [description]
 * @param  {[type]}   judgedId  [description]
 * @param  {Function} next      [description]
 */
function deleteJudgement(refereeId, judgedId, next) {
    var directCypher = `MATCH p=(a:User {uuid:'${refereeId}'})-[r:judge]->(b:User {uuid:'${judgedId}'}) ` +
    "DELETE r";
    db.query(directCypher, {}, function(err, results) {
        if (err) {
            return next(err, null);
        }
        if (results && results.length > 0) {
            next(null, results[0]);
        } else {
            next(null, null);
        }
    });
}

/**
 * [networkInCount description]
 * @param  {[type]}   userId [description]
 * @param  {Function} next   [description]
 */
function networkCount(userId, next) {
    var cypher = `OPTIONAL MATCH (l:User)-[r:judge]->(n:User) WHERE n.uuid = '${userId}' WITH COUNT(r) as networkInCount ` +
    `OPTIONAL MATCH (n2:User)-[r2:judge]->(l2:User) WHERE n2.uuid = '${userId}' WITH networkInCount, COUNT(r2) as networkOutCount ` +
    'RETURN networkInCount, networkOutCount';
    db.query(cypher, {}, function(err, results) {
        if (err) {
            return next(err, null);
        }
        if (results && results.length === 1) {
            next(null, results[0]);
        } else {
            next(null, {networkInCount: 0, networkOutCount: 0});
        }
    });
}

/**
 * [addView description]
 * @param {[type]}   userId [description]
 * @param {Function} next   [description]
 */
function addView(userId, next) {
    find(userId, function(err, user) {
        if (user) {
            if (user.views !== null && user.views !== undefined)
                user.views += 1;
            else {
                user.views = 1;
            }
            save(user, function(err, updatedUser) {
                if (err) next(err, null);
                else next(null, updatedUser);
            });
        } else {
            next(err, null); // User not found
        }
    });
}
