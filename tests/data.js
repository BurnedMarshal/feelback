const User = require('../models/user');
var test = require('tape');
const nodeNum = 10;

var createdUsers = [];

test('CREATE Users', t => {
    'use strict';
    for (let i = 0; i < nodeNum; i++) {
        t.test('CREATE User ' + i, t => {
            var code = Math.floor((Math.random() * 10) + 1);
            var newUser = {
                first_name: "John " + code,
                surname: "Doo",
                name: "John " + code + " Doo",
                birthdate: "09/02/1985",
                email: "test" + code + "@test.it"
            };
            User.save(newUser, function(err, user) {
                t.error(err, 'no error saving user');
                newUser.id = user.id;
                createdUsers.push(user);
                t.deepEquals(newUser, user, 'User object succefflully created');
                t.end();
            });
        });
    }
});

test('RANDOM Evaluations', t => {
    'use strict';
    for (let i = 0; i < nodeNum; i++) {
        t.test("Evaluate " + i, t => {
            var referee = Math.floor((Math.random() * createdUsers.length));
            var judjed = Math.floor((Math.random() * createdUsers.length));
            if (referee === judjed) {
                t.end();
            } else {
                var vote = {
                    professional: Math.floor((Math.random() * 5) + 1),
                    etical: Math.floor((Math.random() * 5) + 1),
                    personal: Math.floor((Math.random() * 5) + 1)
                };
                User.judge(createdUsers[referee], createdUsers[judjed], vote, function(err, relationship) {
                    t.error(err, 'no error creating relationship');
                    t.deepEquals(relationship, {
                        start: createdUsers[referee].id,
                        end: createdUsers[judjed].id,
                        type: 'judge',
                        properties: vote,
                        id: relationship.id
                    }, 'relationship data match');
                    t.end();
                });
            }
        });
    }
});

test('DELETE Users', t => {
    createdUsers.forEach(item => {
        t.test("DELETE user " + item.uuid, t => {
            User.delete(item, function(err) {
                t.error(err, 'no error deleting user node');
                t.end();
            });
        });
    });
});
