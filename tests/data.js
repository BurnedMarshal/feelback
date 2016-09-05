const User = require('../models/user');
var should = require('chai').should();
var assert = require('chai').assert;
const nodeNum = 10;

var createdUsers = [];

describe('CREATE Users', () => {
    'use strict';
    for (let i = 0; i < nodeNum; i++) {
        it('CREATE User ' + i, done => {
            var code = Math.floor((Math.random() * 10) + 1);
            var newUser = {
                first_name: "John " + code,
                surname: "Doo",
                name: "John " + code + " Doo",
                birthdate: "09/02/1985",
                email: "test" + code + "@test.it"
            };
            User.save(newUser, function(err, user) {
                should.not.exist(err, 'no error saving user');
                newUser.id = user.id;
                createdUsers.push(user);
                assert.deepEqual(newUser, user, 'User object succefflully created');
                done();
            });
        });
    }
});

describe('RANDOM Evaluations', () => {
    'use strict';
    for (let i = 0; i < nodeNum; i++) {
        it("Evaluate " + i, done => {
            var referee = Math.floor((Math.random() * createdUsers.length));
            var judjed = Math.floor((Math.random() * createdUsers.length));
            if (referee === judjed) {
                done();
            } else {
                var vote = {
                    professional: Math.floor((Math.random() * 5) + 1),
                    etical: Math.floor((Math.random() * 5) + 1),
                    personal: Math.floor((Math.random() * 5) + 1)
                };
                var expectedAverage = (vote.professional + vote.etical + vote.personal) / 3;
                User.judge(createdUsers[referee], createdUsers[judjed], vote, function(err, relationship) {
                    should.not.exist(err, 'no error creating relationship');
                    vote.average = expectedAverage;
                    assert.deepEqual(relationship, {
                        start: createdUsers[referee].id,
                        end: createdUsers[judjed].id,
                        type: 'judge',
                        properties: vote,
                        id: relationship.id
                    }, 'relationship data match');
                    done();
                });
            }
        });
    }
});

describe('DELETE Users', () => {
    createdUsers.forEach(item => {
        it("DELETE user " + item.uuid, done => {
            User.delete(item, function(err) {
                should.not.exist(err, 'no error deleting user node');
                done();
            });
        });
    });
});
