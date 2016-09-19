var server = require("../../server/server.js");

var request = require("request");
var sinon = require("sinon");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var testServer;
var Twitter;
var client;
var getTweets;

//TODO : make this look more like the objects returned from the twitter API
var testTweets = [{
    text: "Test tweet 1",
    user: "Test user 1"
}, {
    text: "Test tweet 2",
    user: "Test user 2"
}];

describe("Server", function () {

    beforeEach(function () {

        //Only using sinon here as it has the callsArgWith
        //method which I couldn't find in the jasmine API
        client = {
            get: sinon.stub()
        };

        client.get.callsArgWith(2, null, testTweets, null);

        testServer = server(testPort, client);

    });
    afterEach(function () {
        testServer.close();
    });

    it("Server responds to basic request", function (done) {
        request(baseURL + "/api/tweets", function (error, response, body) {
            expect(JSON.parse(body)).toEqual(testTweets);
            done();
        });
    });
});
