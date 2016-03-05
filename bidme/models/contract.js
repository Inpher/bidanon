var mongoose = require('mongoose');

module.exports = function(connection) {
    var Schema = mongoose.Schema;

    var loanContract = new Schema({
        amount: Number,
	interestRate: Number,
	maturityDate: String, 

	borrower: String,
	borrowerSignature: String, 

	lender: String,
	lenderSignature: String
    });

    loanContract.methods.getJSONString = function() {
        // generate your string here 
    };

    loanContract.methods.verifyBorrowerSignature = function(sig, pkey) {
    };

    loanContract.methods.verifyLenderSignature = function(sig, pkey) {
    };
    
    var Contract = connection.model('Contract', loanContract);

    return Contract;
}
