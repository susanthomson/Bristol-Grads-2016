module.exports = function(oauth2Client, verifier, fs, configFile) {

    var oAuthUri = oauth2Client.generateAuthUrl({
        scope: "email",
        prompt: "select_account"
    });

    function authorise(req, callback) {
        var code = req.query.code;
        oauth2Client.getToken(code, function(err, tokens) {
            if (!err) {
                var IdToken = tokens.id_token;
                verifier.verify(IdToken, oauth2Client.clientId_, function(err, tokenInfo) {
                    if (!err) {
                        getAdminIDs().then(function(emails) {
                            if (emails.indexOf(tokenInfo.email) !== -1) {
                                callback(null, tokens.access_token);
                            } else {
                                callback(new Error("Unauthorised user"), null);
                            }
                        }).catch(function(err) {
                            console.log("Error reading admin data: " + err);
                            callback(err, null);
                        });
                    } else {
                        callback(err, null);
                    }
                });
            } else {
                callback(err, null);
            }
        });
    }

    function getAdminIDs() {
        return new Promise(function(resolve, reject) {
            fs.readFile(configFile, "utf8", function(err, data) {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(JSON.parse(data).emails);
                    } catch (e) {
                        reject(e);
                    }
                }
            });
        });
    }

    function addAdmin(email) {
        return new Promise(function(resolve, reject) {
            getAdminIDs().then(function(emails) {
                if (emails.indexOf(email) !== -1) {
                    console.log(email + " is already an admin");
                    reject(400);
                } else {
                    emails.push(email);
                    fs.writeFile(configFile, JSON.stringify({
                        "emails": emails,
                    }), function(err) {
                        if (err) {
                            console.log("Error writing to admin config file" + err);
                            reject(500);
                        } else {
                            resolve(200);
                        }
                    });
                }
            }).catch(function(err) {
                console.log("Error reading from admin config file" + err);
                reject(500);
            });
        });
    }

    function removeAdmin(email) {
        return new Promise(function(resolve, reject) {
            getAdminIDs().then(function(emails) {
                if (emails.indexOf(email) !== -1) {
                    emails.splice(emails.indexOf(email), 1);
                    fs.writeFile(configFile, JSON.stringify({
                        "emails": emails,
                    }), function(err) {
                        if (err) {
                            console.log("Error writing to admin config file" + err);
                            reject(500);
                        } else {
                            resolve(200);
                        }
                    });
                } else {
                    console.log(email + " is not an admin");
                    reject(404);
                }
            }).catch(function(err) {
                console.log("Error reading from admin config file" + err);
                reject(500);
            });
        });
    }

    return {
        authorise: authorise,
        oAuthUri: oAuthUri,
        addAdmin: addAdmin,
        removeAdmin: removeAdmin,
        getAdmins: getAdminIDs
    };
};
