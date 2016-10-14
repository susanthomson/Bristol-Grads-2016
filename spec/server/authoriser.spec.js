var googleAuthoriser = require("../../server/oauth-google.js");

var request = require("request");

var authoriser;
var oauth2Client;
var verifier;
var fs;
var configFile = "config-file";

var testToken = {
    id_token: "4543246426fggfh",
    access_token: "1234567testtoken"
};
var tokenInfo = {
    sub: "978356lgdhrh",
    email: "bob@gmail.com"
};
var oAuthUri = "OAuth URI";
var validEmail = "bob@gmail.com";
var invalidEmail = "notbob@gmail.com";

describe("Authoriser", function() {

    beforeEach(function() {

        oauth2Client = jasmine.createSpyObj("oauth2Client", [
            "generateAuthUrl",
            "getToken"
        ]);
        oauth2Client.clientId_ = "client id";
        oauth2Client.generateAuthUrl.and.callFake(function(scope) {
            return oAuthUri;
        });

        verifier = jasmine.createSpyObj("verifier", [
            "verify"
        ]);

        var adminConfig = {
            emails: ["bob@gmail.com", "alice@gmail.com"]
        };
        fs = jasmine.createSpyObj("fs", [
            "readFile",
            "writeFile",
        ]);
        fs.readFile.and.callFake(function(file, encoding, callback) {
            callback(undefined, JSON.stringify(adminConfig));
        });
        fs.writeFile.and.callFake(function(file, contents, callback) {
            callback(undefined);
        });

        authoriser = googleAuthoriser(oauth2Client, verifier, fs, configFile);
    });

    function getTokenFromCode() {
        oauth2Client.getToken.and.callFake(function(code, callback) {
            callback(null, testToken);
        });
    }

    function verifyToken() {
        verifier.verify.and.callFake(function(token, clientId, callback) {
            callback(null, tokenInfo);
        });
    }

    describe("Authoriser", function() {

        it("callback with error if can't get token from code", function(done) {

            var error = new Error("can't get token from code");
            oauth2Client.getToken.and.callFake(function(code, callback) {
                callback(error, null);
            });

            authoriser.authorise({
                query: {
                    code: "code"
                }
            }, function(err, token) {
                expect(err).toEqual(error);
                done();
            });
        });

        it("callback with error if token doesn't verify", function(done) {

            var error = new Error("Invalid token");
            getTokenFromCode();
            verifier.verify.and.callFake(function(token, clientId, callback) {
                callback(error, null);
            });

            authoriser.authorise({
                query: {
                    code: "code"
                }
            }, function(err, token) {
                expect(err).toEqual(error);
                done();
            });
        });

        it("callback with error if unable to read admin file", function(done) {

            var error = new Error("bad read");
            fs.readFile.and.callFake(function(file, encoding, callback) {
                callback(error, null);
            });

            getTokenFromCode();
            verifyToken();

            authoriser.authorise({
                query: {
                    code: "code"
                }
            }, function(err, token) {
                expect(err).toEqual(error);
                done();
            });
        });

        it("callback with error if unauthorised user", function(done) {

            var badminConfig = {
                emails: ["alice@gmail.com"]
            };
            fs.readFile.and.callFake(function(file, encoding, callback) {
                callback(undefined, JSON.stringify(badminConfig));
            });
            var error = new Error("Unauthorised user");
            getTokenFromCode();
            verifyToken();

            authoriser.authorise({
                query: {
                    code: "code"
                }
            }, function(err, token) {
                expect(err).toEqual(error);
                done();
            });
        });

        it("callback with access token if authorised user", function(done) {

            getTokenFromCode();
            verifyToken();

            authoriser.authorise({
                query: {
                    code: "code"
                }
            }, function(err, token) {
                expect(token).toEqual(testToken.access_token);
                done();
            });
        });
    });

    describe("managing admins", function() {
        var updatedEmails = [];
        var objToWrite = {};

        it("addAdmin updates admin config if admin is not in list", function() {
            updatedEmails = ["bob@gmail.com", "alice@gmail.com", "charlie@gmail.com"];
            objToWrite = {
                "emails": updatedEmails,
            };
            authoriser.addAdmin("charlie@gmail.com").then(function() {
                expect(fs.readFile).toHaveBeenCalled();
                expect(fs.writeFile).toHaveBeenCalledWith(configFile, JSON.stringify(objToWrite), jasmine.any(Function));
            });
        });

        it("removeAdmin updates admin config if admin is in list", function() {
            updatedEmails = ["alice@gmail.com"];
            objToWrite = {
                "emails": updatedEmails,
            };
            authoriser.removeAdmin("bob@gmail.com").then(function() {
                expect(fs.readFile).toHaveBeenCalled();
                expect(fs.writeFile).toHaveBeenCalledWith(configFile, JSON.stringify(objToWrite), jasmine.any(Function));
            });
        });
    });
});
