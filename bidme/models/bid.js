var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var availableBid = new Schema({
        score: Number,
        amount: Number
    });

    var Bid = connection.model('Bid', availableBid);

    return Bid;
}
