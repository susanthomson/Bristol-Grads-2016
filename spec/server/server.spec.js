var server = require("../../server/server.js");
var request = require("request");

var testPort = 12345;

describe("Server", function () {
    var testServer;
    beforeEach(function () {
        testServer = server(testPort);
    });
    afterEach(function () {
        testServer.close();
    });
    it("Server responds to basic request", function (done) {
        request("http://localhost:" + testPort + "/api/test", function (error, response) {
            console.log(response.body);
            expect(response.body).toEqual("Server running");
            done();
        });
    });
});
