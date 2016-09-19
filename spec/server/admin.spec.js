var server = require("../../server/server.js");

var request = require("request");
var sinon = require("sinon");

var testPort = 1234;
var baseUrl = "http://localhost:" + testPort;

var client;
var authoriser;
var testServer;
var cookieJar;

var testToken = "1234567testtoken";

describe("Admin", function () {

    beforeEach(function () {
        cookieJar = request.jar();

        client = {
            get: sinon.stub()
        };

        authoriser = {
            authorise: function() {},
            oAuthUri: "oauth URI"
        };

        testServer = server(testPort, client, authoriser);

    });

    afterEach(function () {
        testServer.close();
    });

    function authenticateUser(token, callback) {
        sinon.stub(authoriser, "authorise", function(req, authCallback) {
            authCallback(null, token);
        });

        request(baseUrl + "/oauth", function(error, response) {
            cookieJar.setCookie(request.cookie("sessionToken=" + token), baseUrl);
            callback();
        });
    }

    it("GET /admin responds with 401 if not logged in", function (done) {
        request(baseUrl + "/admin", function (error, response, body) {
            expect(response.statusCode).toEqual(401);
            done();
        });
    });

    it("GET /admin responds with 200 if logged in", function (done) {
        authenticateUser(testToken, function () {
            request({url: baseUrl + "/admin", jar: cookieJar}, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                done();
            });
        });
    });

    it("GET /api/motd responds with 200 if logged in", function (done) {
        authenticateUser(testToken, function () {
            request({url: baseUrl + "/api/motd", jar: cookieJar}, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                done();
            });
        });
    });

    it("GET /api/motd responds with 200 even if not logged in", function (done) {
        request(baseUrl + "/api/motd", function (error, response, body) {
            expect(response.statusCode).toEqual(200);
            done();
        });
    });

    it("POST /admin/motd responds with 401 if not logged in", function (done) {
        request.post(baseUrl + "/admin/motd", function (error, response, body) {
            expect(response.statusCode).toEqual(401);
            done();
        });
    });

    it("POST /api/motd responds with 200 if logged in", function (done) {
        authenticateUser(testToken, function () {
            request.post({url: baseUrl + "/admin/motd", jar: cookieJar, body: JSON.stringify({
                    motd: "lol",
                }), headers: {"Content-type": "application/json"}}, function (error, response, body) {
                expect(response.statusCode).toEqual(200);
                done();
            });
        });
    });

    it("POST /api/motd changes motd if logged in", function (done) {
        var changedMotd = "lol";
        authenticateUser(testToken, function () {
            request(baseUrl + "/api/motd", function (error, response, body) {
                var motd = body;
                request.post({url: baseUrl + "/admin/motd", jar: cookieJar, body: JSON.stringify({
                        motd: changedMotd,
                    }), headers: {"Content-type": "application/json"}}, function (error, response, body) {
                    expect(response.statusCode).toEqual(200);
                    request(baseUrl + "/api/motd", function (error, response, body) {
                        expect(JSON.parse(body)).toEqual(changedMotd);
                        done();
                    });
                });
            });
        });
    });

    it("POST /api/motd doesn't change motd if not logged in", function (done) {
        request(baseUrl + "/api/motd", function (error, response, body) {
            var motd = JSON.parse(body);
            request.post({url: baseUrl + "/admin/motd", jar: cookieJar, body: JSON.stringify({
                    motd: "lol",
                }), headers: {"Content-type": "application/json"}}, function (error, response, body) {
                expect(response.statusCode).toEqual(401);
                request(baseUrl + "/api/motd", function (error, response, body) {
                    expect(JSON.parse(body)).toEqual(motd);
                    done();
                });
            });
        });
    });

});
