const User = require('../models/user');
var should = require('chai').should();
var assert = require('chai').assert;
const nodeNum = 10;

const relationType = ['amico', 'conoscente', 'parente', 'collega'];

var createdUsers = [];
var createdJudgements = [];

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
                var vote = null;
                var expectedAverage = null;
                if (i === 0) { // Special condition with null vote
                    vote = {
                        professional: Math.floor((Math.random() * 5) + 1),
                        etical: null,
                        personal: Math.floor((Math.random() * 5) + 1),
                        type: relationType[Math.floor((Math.random() * 3))]
                    };
                    expectedAverage = (vote.professional + vote.personal) / 2;
                } else {
                    vote = {
                        professional: Math.floor((Math.random() * 5) + 1),
                        etical: Math.floor((Math.random() * 5) + 1),
                        personal: Math.floor((Math.random() * 5) + 1),
                        type: relationType[Math.floor((Math.random() * 3))]
                    };
                    expectedAverage = (vote.professional + vote.etical + vote.personal) / 3;
                }

                User.judge(createdUsers[referee], createdUsers[judjed], vote, function(err, relationship) {
                    should.not.exist(err, 'no error creating relationship');
                    vote.average = expectedAverage;
                    if (vote.etical === null) { // Special condition clear null field in vote
                        delete vote.etical;
                    }
                    assert.deepEqual(relationship, {
                        start: createdUsers[referee].id,
                        end: createdUsers[judjed].id,
                        type: 'judge',
                        properties: vote,
                        id: relationship.id
                    }, 'relationship data match');
                    var found = false;
                    for (let j = 0; j < createdJudgements.length; j++) {
                        if (createdJudgements[j].start === relationship.start && createdJudgements[j].end === relationship.end) {
                            found = true;
                            createdJudgements[j] = relationship;
                            break;
                        }
                    }
                    if (!found) {
                        if (i === 0) { // Special case add null value in relationship for future check in test
                            relationship.properties.etical = null;
                        }
                        createdJudgements.push(relationship);
                    }

                    done();
                });
            }
        });
        describe('Check Judgement ' + i, final => {
            'use strict';
            it('Check getJudgement model method', done => {
                if (createdJudgements[i]) {
                    var referee = null;
                    var judged = null;
                    for (let k = 0; k < createdUsers.length; k++) {
                        if (createdUsers[k].id === createdJudgements[i].start) {
                            referee = createdUsers[k];
                        } else if (createdUsers[k].id === createdJudgements[i].end) {
                            judged = createdUsers[k];
                        }
                        if (referee && judged) {
                            break;
                        }
                    }
                    User.getJudgement(referee.uuid, judged.uuid, (err, judgement) => {
                        should.not.exist(err, 'no error reading relationship');
                        assert.deepEqual(judgement, createdJudgements[i].properties);
                        done();
                    });
                } else {
                    done();
                }
            });
        });
    }
    after('DELETE Users', function() {
        describe('DELETE Users', () => {
            'use strict';
            for (let i = 0; i < createdUsers.length; i++) {
                it("DELETE user " + createdUsers[i].uuid, done => {
                    User.delete(createdUsers[i], function(err) {
                        should.not.exist(err, 'no error deleting user node');
                        done();
                    });
                });
            }
        });
    });
});

/* describe('Check Judgements', final => {
    'use strict';
    console.log(createdJudgements.length);
    for (let i = 0; i < createdJudgements.length; i++) {
        it('Check getJudgement model method', done => {
            var referee = null;
            var judged = null;
            for (let k = 0; k < createdUsers.length; k++) {
                if (createdUsers[k].id === createdJudgements[i].start) {
                    referee = createdUsers[k];
                } else if (createdUsers[k].id === createdJudgements[i].end) {
                    judged = createdUsers[k];
                }
                if (referee && judged) {
                    break;
                }
            }
            User.getJudgement(referee.uuid, judged.uuid, (err, judgement) => {
                should.not.exist(err, 'no error reading relationship');
                assert.deepEqual(judgement, createdJudgements.properties);
                assert.true(false);
                done();
                if (i === (createdJudgements.length - 1)) {
                    final();
                }
            });
        });
    }
});*/
