var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var bidSchema = new Schema({
        intRate: Number,
        maturity: Number,
        u_id: mongoose.Schema.Types.ObjectId,
        req_id: mongoose.Schema.Types.ObjectId,
        status: {type: String, enum:['NEW', 'IN_PROGRESS', 'DONE']}
    });

    var Bid = connection.model('Bid', bidSchema);

    return Bid;
}
