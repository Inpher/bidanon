var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var pritaveProfileSchema = new Schema({
        info: String,
        u_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}]
    });

    var PrivateProfile = connection.model('PrivateProfile', pritaveProfileSchema);

    return PrivateProfile;
}