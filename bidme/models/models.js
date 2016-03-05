module.exports = function(connection) {

    var User = require('./user')(connection);
    var Person = require('./person')(connection);
    var Bid = require('./bid')(connection);

    return {
        user: User,
        person: Person,
        bid: Bid
    }
}