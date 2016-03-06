p = generateKeyRing(); 
p.then( function(x) { bankKeyRing=x; } );
borrower_id = JSON.parse(localStorage.getItem("ls.u_id")); 
publicData = { "amount":10000, "interestRate":1.25, "maturity":10, "borrower_id":borrower_id, "lender_id": "ID1234"}
p = createAndSignContract(publicData, bankKeyRing.pkeyEncrypt)
