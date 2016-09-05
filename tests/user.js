const User = require('../models/user');
var should = require('chai').should();
var assert = require('chai').assert;

var createdResource = null;

describe('Testing Save Update Find and Delete model methods', () => {
    it('CREATE User', done => {
        var newUser = {name: 'John Doo', birthdate: '01/01/1980'};
        User.save(newUser, function(err, user) {
            should.not.exist(err, 'no error saving user');
            newUser.id = user.id;
            createdResource = user;
            assert.deepEqual(newUser, user, 'User object succefflully created');
            done();
        });
    });

    it('UPDATE User', done => {
        var newUser = createdResource;
        newUser.name = 'Jonny Doo';
        User.save(newUser, function(err, user) {
            should.not.exist(err, 'no error updating user');
            createdResource = user;
            newUser.uuid = user.uuid;
            assert.deepEqual(newUser, user, 'User object succefflully updated');
            done();
        });
    });

    it('FIND User', done => {
        var newUser = createdResource;
        User.where({uuid: newUser.uuid}, function(err, users) {
            should.not.exist(err, 'no error searcing user');
            assert.deepEqual(newUser, users[0], 'User object succefflully updated');
            done();
        });
    });

    it('DELETE User', done => {
        var newUser = createdResource;
        User.delete(newUser, function(err) {
            should.not.exist(err, 'no error deleting user node');
            done();
        });
    });
});
