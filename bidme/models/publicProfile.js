var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var publicProfileSchema = new Schema({
        name: String,
        u_id: mongoose.Schema.Types.ObjectId,
        avgMonthlyIncome: Number,
        avgMonthlySpendings: Number,
        desc: String,
        score: Number
    });

    var PublicProfile = connection.model('PublicProfile', publicProfileSchema);

    return PublicProfile;
}
