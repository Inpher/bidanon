module.exports = function(connection) {

    var User = require('./user')(connection);
    var Person = require('./person')(connection);
    var Bid = require('./bid')(connection);
    var PrivateProfile = require('./privateProfile')(connection);
    var PublicProfile = require('./publicProfile')(connection);
    var Request = require('./request')(connection);

    return {
        user: User,
        person: Person,
        bid: Bid,
        request: Request,
        privateProfile: PrivateProfile,
        publicProfile: PublicProfile
    }
}