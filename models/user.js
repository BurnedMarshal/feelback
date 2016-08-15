const CONFIG = require('../conf/database');
const db = require('seraph')({
    server: CONFIG.database,
    user: CONFIG.username,
    pass: CONFIG.password});

module.exports = {
    findById: find,
    save: save,
    where: where,
    delete: del
};

/**
 * Retrieve User node from Neo4j using node.id
 * @param  {[Integer]}   userId User node id
 * @param  {Function} next   [callback]
 */
function find(userId, next) {
    db.find({id: userId}, false, 'User', function(err, users) {
        if (users.length === 1) {
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
