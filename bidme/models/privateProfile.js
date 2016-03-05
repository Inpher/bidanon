var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var privateProfileSchema = new Schema({
        encInfo: String,
	encKey: String,
        u_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    });

    var PrivateProfile = connection.model('PrivateProfile', privateProfileSchema);

    return PrivateProfile;
}
