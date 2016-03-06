function print(x) {console.log(x);}


p = generateKeyRing(); p.then( function(x) { bankKeyRing=x; } );

borrower_id = JSON.parse(localStorage.getItem("ls.u_id")); 
publicData = { "amount":10000, "interestRate":1.25, "maturity":10, "borrower_id":borrower_id, "lender_id": "ID1234"}
createAndSignContract(publicData, bankKeyRing.pkeyEncrypt).then(function(c) {
    encrContract=c;
    console.log(c);
    var k = encrContract.lenderEncKey; encrContract.lenderEncKey = encrContract.borrowerEncKey; encrContract.borrowerEncKey=k;
    var k = encrContract.lenderSignature; encrContract.lenderSignature = encrContract.borrowerSignature; encrContract.borrowerSignature=k;

    return decryptPrivateInfo(encrContract);
}).then(function(fullcontract) {
    console.log(fullcontract);
    return lenderSign(encrContract);
}).then(function(ec) {
    console.log(ec);
}); 
