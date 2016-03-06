var mongoose = require('mongoose');

module.exports = function(connection) {
    var Schema = mongoose.Schema;

    var loanContract = new Schema({
	publicInfo: {
	    amount: Number,
	    interestRate: Number,
	    maturityDate: String,
	    lender_id: String,
	    borrower_id: String,
	},
	encPrivateInfo: String,
	formattedContent: String,

	borrowerEncKey: String,
	lenderEncKey: String,
	
	borrowerSignature: String, 
	lenderSignature: String
    });

    var Contract = connection.model('Contract', loanContract);

    return Contract;
}
