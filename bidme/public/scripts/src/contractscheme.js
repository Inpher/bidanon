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
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]), 
};

function generateKeyRing() {
    var reps = {};
    //skeySign = null; 
    //var pkeySign = null;
    //var skeyEncrypt = null;
    //var pkeyEncrypt = null;
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
function encryptPrivateKey(sKey, pwd) {
    var aesKey;
    var exportedSKey; //ArrayBuffer

    return new Promise(function (resolve, reject) {
        deriveKeyFromPwd(pwd).then(function(aek) {
	    aesKey = aek;
	    return crypto.subtle.exportKey(
		    "pkcs8",
		    sKey);
	}).then(function(expk) {
	    exportedSKey=expk;
	    return crypto.subtle.encrypt(
		    AES_ENCRYPT_ALGORITHM,
		    aesKey,
		    exportedSKey);
	}).then(function(encK) {
	    return resolve(arrayBufferToBase64(encK));
	}).catch(function(err) {
	    return reject(err);
	});
    });
} 

//input encKey (base64, PKCS8), pwd
function decryptPrivateKey(encKey, pwd, algo, usage) {
    var encKeyBuf = base64ToArrayBuffer(encKey);
    var aesKey; 
    return deriveKeyFromPwd(pwd).then(function(aek) {
	aesKey = aek;
	return crypto.subtle.decrypt(AES_ENCRYPT_ALGORITHM, aesKey, encKeyBuf)
    }).then(function(skeyBytes) {
	return crypto.subtle.importKey("pkcs8", skeyBytes, algo, true, usage);
    });
}

function test() {
    generateKeyRing().then(function(kr) {
	crypto.subtle.exportKey("pkcs8", kr.skeyEncrypt).then(function(skeyStr) { console.log(arrayBufferToBase64(skeyStr)); }); 
	encryptPrivateKey(kr.skeyEncrypt, "pwd").then(function(encSkey) {
	    return decryptPrivateKey(encSkey, "pwd", RSA_ENCRYPT_ALGORITHM, ["decrypt"]);
	}).then(function(decSkey) {
	    return crypto.subtle.exportKey("pkcs8", decSkey);
	}).then(function(skeyStr2) {
	    console.log(arrayBufferToBase64(skeyStr2));
	});
    });
}
