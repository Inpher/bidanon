var crypto = window.crypto || window.msCrypto;

if (crypto && !crypto.subtle && crypto.webkitSubtle) {
	crypto.subtle = crypto.webkitSubtle;
}; 

function generateKeys() {
    var skeySign = null; 
    var pkeySign = null;
    var skeyEncrypt = null;
    var pkeyEncrypt = null;

    var promiseKeyEncrypt = null;
    var promiseKeySign = null;

    if (crypto.subtle) {
	console.log("Cryptography API Supported");
	
	//Parameters:
	//1. Asymmetric Encryption algorithm name and its requirements
	//2. Boolean indicating extractable. which indicates whether or not the raw keying material may be exported by the application (http://www.w3.org/TR/WebCryptoAPI/#dfn-CryptoKey-slot-extractable)
	//3. Usage of the keys. (http://www.w3.org/TR/WebCryptoAPI/#cryptokey-interface-types)
	promiseKeyEncrypt = crypto.subtle.generateKey({name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: {name: "SHA-256"}}, false, ["encrypt", "decrypt"]);

	promiseKeyEncrypt.then(function(key){
            skeyEncrypt = key.privateKey;
            pkeyEncrypt = key.publicKey;
	});

	promiseKeyEncrypt.catch = function(e){
            console.log(e.message);
	}

	promiseKeySign = crypto.subtle.generateKey({name: "RSA-PSS", modulusLength: 2048, publicExponent: new Uint8Array([0x01, 0x00, 0x01]), hash: {name: "SHA-256"}}, false, ["sign", "verify"]);

	promiseKeySign.then(function(key){
            skeySign = key.privateKey;
            pkeySign = key.publicKey;
	});

	promiseKeySign.catch = function(e) {
	    console.log(e.message)
	}
    }
    else
    {
	alert("Cryptography API not Supported");
    }
}

function stringToArrayBuffer(string) {
       var encoder = new TextEncoder("utf-8");
       return encoder.encode(string);
}


function deriveKeyFromPwd(pwd) {
        // First, create a PBKDF2 "key" containing the password
        return crypto.subtle.importKey(
            "raw",
            stringToArrayBuffer(pwd),
            {"name": "PBKDF2"},
            false,
            ["deriveKey"]).
        // Derive a key from the password
        then(function(baseKey){
            return crypto.subtle.deriveKey(
                {
                    "name": "PBKDF2",
                    "salt": stringToArrayBuffer(''),
                    "iterations": 100,
                    "hash": 'SHA-256'
                },
                baseKey,
                {"name": "AES-CBC", "length": 256}, // Key we want
                true,                               // Extrable
                ["encrypt", "decrypt"]              // For new key
                );
        });
}


