var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var publicProfileSchema = new Schema({
        name: String,
        u_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        avgMonthlyIncome: Number,
        avgMonthlySpendings: Number,
        desc: String,
        score: Number
    });

    var PublicProfile = connection.model('PublicProfile', publicProfileSchema);

    return PublicProfile;
}
