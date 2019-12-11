var crypto = require('crypto');
module.exports = {

    encrypt: function (text) {
            if (text === null || typeof text === 'undefined') {return text;};
            var cipher = crypto.createCipher('aes-256-cbc', process.env.enc_key);
            var crypted = cipher.update(text, 'utf8', 'hex');
            crypted += cipher.final('hex');
            return crypted;
    },

    decrypt: function (text) {
		    if (text === null || typeof text === 'undefined') {return text;}
		    var decipher = crypto.createDecipher('aes-256-cbc', process.env.enc_key);
                    var dec = decipher.update(text,'hex','utf8');
            dec += decipher.final('utf8');
            return dec;
    }

};