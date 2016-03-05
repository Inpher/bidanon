var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var bidSchema = new Schema({
        intRate: Number,
        maturity: Number,
        u_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        req_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'Request'}]
    });

    var Bid = connection.model('Bid', bidSchema);

    return Bid;
}
