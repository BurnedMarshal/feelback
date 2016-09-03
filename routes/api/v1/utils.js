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
        promises.push(saveUserBatch(user));
    }
    Promise.all(promises)
    .then(users => {
        var judgements = [];
        var userMap = users.reduce((a, b) => {
            a[b.name] = b;
            return a;
        }, {});
        for (let referee in req.body.relations) {
            if (Object.hasOwnProperty.call(req.body.relations, referee)) {
                for (let judged in req.body.relations[referee]) {
                    if (Object.hasOwnProperty.call(req.body.relations[referee], judged)) {
                        judgements.push(judgeUserBatch(userMap[referee], userMap[judged], req.body.relations[referee][judged]));
                    }
                }
            }
        }
        Promise.all(judgements)
        .then(judgements => {
            return res.status(201).json({users: users, judgements: judgements});
        })
        .catch(err => {
            return res.status(500).json({message: 'Internal Server Error', error: err});
        });
    })
    .catch(err => {
        return res.status(500).json({message: 'Internal Server Error', error: err});
    });
});

router.delete('/clearNetwork', function(req, res) {
    var cypher = "MATCH (n:User)-[r:judge]->() WHERE n.isTemp = true DELETE n, r";
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

/**
 * [judgeUserBatch description]
 * @param  {Object} referee User orbject for referee
 * @param  {Object} judged   User object for judge
 * @param  {Object} vote    Judgement object
 * @return {[function]}         reject and resolve callback
 */
function judgeUserBatch(referee, judged, vote) {
    return new Promise((resolve, reject) => {
        User.judge(referee, judged, vote, (err, judgemet) => {
            if (err) return reject(err);
            return resolve(judgemet);
        });
    });
}

module.exports = router;
