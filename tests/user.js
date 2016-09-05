const User = require('../models/user');
var test = require('tape');

var createdResource = null;

test('CREATE User', t => {
    var newUser = {name: 'John Doo', birthdate: '01/01/1980'};
    User.save(newUser, function(err, user) {
        t.error(err, 'no error saving user');
        newUser.id = user.id;
        createdResource = user;
        t.deepEquals(newUser, user, 'User object succefflully created');
        t.end();
    });
});

test('UPDATE User', t => {
    var newUser = createdResource;
    newUser.name = 'Jonny Doo';
    User.save(newUser, function(err, user) {
        t.error(err, 'no error updating user');
        createdResource = user;
        newUser.uuid = user.uuid;
        t.deepEquals(newUser, user, 'User object succefflully updated');
        t.end();
    });
});

test('FIND User', t => {
    var newUser = createdResource;
    User.where({uuid: newUser.uuid}, function(err, users) {
        t.error(err, 'no error searcing user');
        t.deepEquals(newUser, users[0], 'User object succefflully updated');
        t.test('DELETE User', t => {
            User.delete(users[0], function(err) {
                t.error(err, 'no error deleting user node');
                t.end();
            });
        });
        t.end();
    });
});
