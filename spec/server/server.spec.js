var server = require("../../server/server.js");

var request = require("request");
var sinon = require("sinon");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var testServer;
var Twitter;
var client;
var getTweets;

//TODO : make this look more like the objects return from the twitter API
var testTweets = {
    tweet1: {
        test: "Test tweet 1",
        user: "Test user 1"
    },
    tweet2: {
        test: "Test tweet 2",
        user: "Test user 2"
    }
};

describe("Server", function () {

    beforeEach(function () {

        console.log("before each");
        Twitter = sinon.stub().returns(client);

        client = {
            get: sinon.stub()
        };

        Twitter.returns(client);

        //getTweets = sinon.spy();
        //getTweets.returns(testTweets);

        client.get.callsArgWith(2, null, testTweets, null);

        testServer = server(testPort);

    });
    afterEach(function () {
        testServer.close();
    });

    it("Server responds to basic request", function (done) {
        console.log("inside test");
        request(baseURL + "/api/tweets", function (error, response, body) {
            //expect(getTweets.calledOnce).toBe(true);
            console.log(body);
            expect(body).toEqual(testTweets);
            done();
        });
    });
});
