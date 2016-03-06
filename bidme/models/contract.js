var mongoose = require('mongoose');

module.exports = function(connection) {
    var Schema = mongoose.Schema;

    var loanContract = new Schema({
	publicInfo: { //these fields are added automatically added in the database from the formattedContent 
	    amount: Number,
	    interestRate: Number,
	    maturityDate: String,
	    lender_id: String,
	    borrower_id: String,
	},
	//these are the minimal fields
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
