var crypto = window.crypto || window.msCrypto;

if (crypto && !crypto.subtle && crypto.webkitSubtle) {
	crypto.subtle = crypto.webkitSubtle;
}; 

var SIGN_ALGORITHM={
		name: "RSA-PSS", 
		modulusLength: 2048, 
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]), 
		hash: {name: "SHA-256"}};
var RSA_ENCRYPT_ALGORITHM={name: "RSA-OAEP", 
		modulusLength: 2048, 
		publicExponent: new Uint8Array([0x01, 0x00, 0x01]), 
		hash: {name: "SHA-256"}};
var AES_ENCRYPT_ALGORITHM={name: "AES-CBC",
		iv: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
				    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])};

var AES_ENCRYPT_ALGORITHM_WITH_RANDOM_IV={name: "AES-CBC", length: 256, iv: new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
				    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])};

function generateKeyRing() {
    var reps = {};
    return new Promise(function (resolve, reject) {
        crypto.subtle.generateKey(
	    	RSA_ENCRYPT_ALGORITHM, 
		true, 
		["encrypt", "decrypt"])
	.then(function(key){
            reps.skeyEncrypt = key.privateKey;
            reps.pkeyEncrypt = key.publicKey;
 	    return crypto.subtle.generateKey(
		SIGN_ALGORITHM, 
		true, ["sign", "verify"]);
	}).then(function(key){
            reps.skeySign = key.privateKey;
            reps.pkeySign = key.publicKey;
	    return resolve(reps);
	}).catch(function(err) {
	    reject(err);
	});
    });
}

function stringToArrayBuffer(string) {
       var encoder = new TextEncoder("utf-8");
       return encoder.encode(string);
}

function arrayBufferToString(bytes) {
       var encoder = new TextEncoder("utf-8");
       return encoder.decode(bytes);
}

function arrayBufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return window.btoa( binary );
}

function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

//returns a promise to an AES key with 0 IV
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


//input sKey, cryptoKey
//returns a promise to an ArrayBuffer containing the AES encryption of
//the pkcs8
function encryptPrivateKey(sKey, pwdAesKey) {

    return crypto.subtle.exportKey("pkcs8",sKey)
	.then(function(exportedSKey) {
	    return crypto.subtle.encrypt(
		    AES_ENCRYPT_ALGORITHM,
		    pwdAesKey,
		    exportedSKey);
	});
} 

//input encKey (ArrayBuffer, PKCS8), pwd
function decryptPrivateKey(encKeyBuf, pwdAesKey, algo, usage) {
    var aesKey; 
    return crypto.subtle.decrypt(AES_ENCRYPT_ALGORITHM, pwdAesKey, encKeyBuf)
	.then(function(skeyBytes) {
	    return crypto.subtle.importKey("pkcs8", skeyBytes, algo, true, usage);
	});
}


//generates and exports a keyring
//returns a promise to an encrypted keyring
function encryptAndExportKeyring(keyRing, pwd) {
    var pwdAesKey;
    var exportedKeyRing={};
    
    return new Promise(function(resolve, reject) {
	deriveKeyFromPwd(pwd).then(function (k) {
	    pwdAesKey = k;
	    //export the encrypt pubkey
	    return crypto.subtle.exportKey("spki",keyRing.pkeyEncrypt);
	}).then(function(ab) {
	    exportedKeyRing.pkeyEncrypt = arrayBufferToBase64(ab);
	    //export the encrypt privkey
	    return encryptPrivateKey(keyRing.skeyEncrypt, pwdAesKey);
	}).then(function(ab) {
	    exportedKeyRing.skeyEncrypt = arrayBufferToBase64(ab);
	    //export the sign key
	    return crypto.subtle.exportKey("spki",keyRing.pkeySign);
	}).then(function(ab) {
	    exportedKeyRing.pkeySign = arrayBufferToBase64(ab);
	    //export the encrypt privkey
	    return encryptPrivateKey(keyRing.skeySign, pwdAesKey);
	}).then(function(ab) {
	    exportedKeyRing.skeySign = arrayBufferToBase64(ab);
	    return resolve(exportedKeyRing);
	}).catch(function(err) {
	    return reject(err);
	});
    });
}

//generates and exports a keyring
//returns a promise to an encrypted keyring
function generateEncryptAndExportKeyring(pwd) {
    return generateKeyRing().then(function(kr) {
	return encryptAndExportKeyring(kr, pwd);
    });
}


//imports the encrypted keyring
function importAndDecryptKeyring(encKRing, pwd) {
    var pwdAesKey;
    var keyRing={};

    return new Promise(function(resolve, reject) {
	deriveKeyFromPwd(pwd).then(function (k) {
	    pwdAesKey = k;
	    //imports the Encrypt public key
	    return crypto.subtle.importKey(
		    "spki",
		    base64ToArrayBuffer(encKRing.pkeyEncrypt),
		    RSA_ENCRYPT_ALGORITHM,
		    true, ['encrypt'])
	}).then(function(crk) {
	    keyRing.pkeyEncrypt = crk;
	    //import the Encrypt private key
	    return decryptPrivateKey(
		    base64ToArrayBuffer(encKRing.skeyEncrypt),
		    pwdAesKey,RSA_ENCRYPT_ALGORITHM,['decrypt']);
	}).then(function(crk) {
	    keyRing.skeyEncrypt = crk;
	    //imports the sign public key
	    return crypto.subtle.importKey(
		    "spki",
		    base64ToArrayBuffer(encKRing.pkeySign),
		    SIGN_ALGORITHM,
		    true, ['verify']);
	}).then(function(crk) {
	    keyRing.pkeySign = crk;
	    //import the Sign private key  
	    return decryptPrivateKey(
		    base64ToArrayBuffer(encKRing.skeySign)
		    ,pwdAesKey,SIGN_ALGORITHM,['sign']);
	}).then(function(crk) {
	    keyRing.skeySign = crk;
	    return resolve(keyRing);
	}).catch(function(err) {
	    return reject(err);
	});
    });
}

/*
function byteArrayToString(bytes) {
    var chars = [];
    for(var i = 0, n = bytes.length; i < n;) {
        chars.push(((bytes[i++] & 0xff) << 8) | (bytes[i++] & 0xff));
    }
    return String.fromCharCode.apply(null, chars);
}

function stringToByteArray(str) {
    var bytes = [];
    for(var i = 0, n = str.length; i < n; i++) {
        var char = str.charCodeAt(i);
        bytes.push(char >>> 8, char & 0xFF);
    }
    return bytes;
}
*/

function encrypt(jsonStr, pkeyEncrypt) {
    var aesSessionKey;
    var aesSessionKeyBytes; 
    var ctb64;
    var encSessionKeyb64; 
    return new Promise(function(resolve, reject) {
	var ptBytes = stringToArrayBuffer(jsonStr);
	// generate AES session key
	crypto.subtle.generateKey(AES_ENCRYPT_ALGORITHM_WITH_RANDOM_IV, true, ["encrypt", "decrypt"]).then(function(aesk) {
	    aesSessionKey = aesk;
	    return crypto.subtle.encrypt(AES_ENCRYPT_ALGORITHM_WITH_RANDOM_IV, aesSessionKey, ptBytes);
	}).then(function(ctBytes) {
	    ctb64 = arrayBufferToBase64(ctBytes);
	    return crypto.subtle.exportKey("raw", aesSessionKey);
	}).then(function(keyBytes) {
	    aesSessionKeyBytes = keyBytes;
	    return crypto.subtle.encrypt(RSA_ENCRYPT_ALGORITHM, pkeyEncrypt, aesSessionKeyBytes); 
	}).then(function(encSessionKeyBytes) {
	    return resolve({"ct": ctb64, "enckey": arrayBufferToBase64(encSessionKeyBytes)}); 
	}).catch(function(err) {
	    return reject(err);
	}); 
    });
}

function decrypt(ct, skeyEncrypt) {
    return new Promise(function(resolve, reject) {
	var encAesBytes = base64ToArrayBuffer(ct["enckey"]); 
	crypto.subtle.decrypt(RSA_ENCRYPT_ALGORITHM, skeyEncrypt, encAesBytes).then(function(aeskeyBytes) {
	    return crypto.subtle.importKey("raw", aeskeyBytes, AES_ENCRYPT_ALGORITHM_WITH_RANDOM_IV, true, ["encrypt", "decrypt"]); 
	}).then(function(aesKey) {
	    var ctBytes = base64ToArrayBuffer(ct["ct"]); 
	    return crypto.subtle.decrypt(AES_ENCRYPT_ALGORITHM_WITH_RANDOM_IV, aesKey, ctBytes);
	}).then(function(ptBytes) {
	    return resolve(arrayBufferToString(ptBytes)); 
	}).catch(function(err) { return reject(err)}); 
    });  
}

function reencryptSessionKey(encAesKey, skeyEncrypt, pkeyEncryptDest) {
    return new Promise(function(resolve, reject) {
	var encAesBytes = base64ToArrayBuffer(encAesKey);
	crypto.subtle.decrypt(RSA_ENCRYPT_ALGORITHM, skeyEncrypt, encAesBytes).then(function(aeskeyBytes) {
	    return crypto.subtle.encrypt(RSA_ENCRYPT_ALGORITHM, pkeyEncryptDest, aeskeyBytes); 
	}).then(function(newEncKeyBytes) {
	    return resolve(arrayBufferToBase64(newEncKeyBytes)); 
	}).catch(function(err) { reject(err); });
    }); 
}

function sign(jsonStr, skeySign) {
    var msgBytes = stringToArrayBuffer(jsonStr);
    var sigb64; 
    return new Promise(function(resolve, reject) {
	crypto.subtle.sign(SIGN_ALGORITHM, skeySign, msgBytes).then(function(sigBytes) {
	    return resolve(arrayBufferToBase64(sigBytes)); 
	}).catch(function (err) {
	    return reject(err);
	});
    });
}

function verify(msgStr, sigb64, pkeySign) {
    var msgBytes = stringToArrayBuffer(msg); 
    var sigBytes = base64ToArrayBuffer(sigb64); 
    return crypto.subtle.verify(SIGN_ALGORITHM, pkeySign, sigBytes, msgBytes);
}
