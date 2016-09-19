var google = require("googleapis");
var verifier = require("google-id-token-verifier");

module.exports = function(oauthClientId, oauthSecret) {
    var OAuth2Client = google.auth.OAuth2;
    var REDIRECT_URL = "http://127.0.0.1:8080/oauth";
    var sub = "101228413260002753301"; //hardcode admin's google identifier'

    var oauth2Client = new OAuth2Client(oauthClientId, oauthSecret, REDIRECT_URL);

    var oAuthUri = oauth2Client.generateAuthUrl({
        access_type: "offline", // will return a refresh token
        scope: "profile"
    });


    function authorise(req, callback) {
        var code = req.query.code;
        oauth2Client.getToken(code, function (err, tokens) {
            if(!err) {
                //TODO: is this necessary? probs not
                oauth2Client.setCredentials(tokens);
                var IdToken = tokens.id_token;
                verifier.verify(IdToken, oauthClientId, function (err, tokenInfo) {
                    if (!err) {
                        console.log(tokenInfo.sub);
                        if (tokenInfo.sub === sub) {
                            callback(null, tokens.access_token);
                        } else {
                            callback("bad user", null);
                        }
                    } else {
                        callback(err, null);
                    }
                });
            } else {
                callback(err, null);
            }
        });
    }

    return {
        authorise: authorise,
        oAuthUri: oAuthUri
    };
};
