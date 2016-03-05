var msg = "This is a secret message."
p = generateKeyRing(); 
p.then(function(x) { kr = x; });
p = encrypt(msg, kr.pkeyEncrypt);
p.then( function(x) { ct = x; });
p = decrypt(ct, kr.skeyEncrypt);
