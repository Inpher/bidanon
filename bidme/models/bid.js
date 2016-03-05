var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var bidSchema = new Schema({
        intRate: Number,
        maturity: Number,
        u_id: mongoose.Schema.Types.ObjectId,
        req_id: mongoose.Schema.Types.ObjectId
    });

    var Bid = connection.model('Bid', bidSchema);

    return Bid;
}
