var express = require('express');
var router = express.Router();
const User = require('../../../models/user');
const CONFIG = require('../../../conf/config');
const db = require('seraph')({
    server: CONFIG.database,
    user: CONFIG.username,
    pass: CONFIG.password});

router.post('/populateNetwork', function(req, res) {
    'use strict';
    var promises = [];
    for (let i = 0; i < req.body.nodes.length; i++) {
        let user = {
            name: req.body.nodes[i],
            isTemp: true
        };
        console.log(user);
        promises.push(saveUserBatch(user));
    }
    Promise.all(promises)
    .then(users => {
        return res.status(201).json(users);
    })
    .catch(err => {
        return res.status(500).json({message: 'Internal Server Error', error: err});
    });
});

router.delete('/clearNetwork', function(req, res) {
    var cypher = "MATCH (n:User) WHERE n.isTemp = true DELETE n";
    db.query(cypher, {}, (err, results) => {
        if (err) {
            return res.status(500).json({message: 'Internal server Error', error: err});
        }
        return res.status(200).json({message: 'nodes deleted'});
    });
});

/**
 * Save user inside a Promise
 * @param  {Object} user simple user object
 * @return {[function]}      reject and resolve function
 */
function saveUserBatch(user) {
    return new Promise((resolve, reject) => {
        User.save(user, (err, savedUser) => {
            if (err) return reject(err);
            return resolve(savedUser);
        });
    });
}

module.exports = router;
