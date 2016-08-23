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
    judge: judge
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
