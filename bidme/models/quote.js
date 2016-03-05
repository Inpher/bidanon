var mongoose = require('mongoose');

module.exports = function(connection) {
    var Schema = mongoose.Schema;

    var quote = new Schema({
        numContracts: Number,
	    price: Number,
	    parValue: Number, 
        maturityDate: String, 

	    owner: String, 
	    lender: String,
    });

    quote.methods.getJSONString = function() {
        // generate your string here 
    };
    
    var Quote = connection.model('Quote', quote);

    return Quote;
}
