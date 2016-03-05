var mongoose = require('mongoose');

module.exports = function(connection) {

    var Schema = mongoose.Schema;

    var requestSchema = new Schema({
        amount: String,
        maturity: Number,
        u_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        
    });

    var Request = connection.model('Request', requestSchema);

    return Request;
}