var tweetSearch = require("../../server/tweetSearch.js");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var tweetSearcher;
var client;
var getTweets;

var testTimeline = [{
    id: 1,
    text: "Test tweet 1",
}, {
    id: 2,
    text: "Test tweet 2",
}];

var testTweets = {
    statuses: testTimeline,
};

describe("tweetSearch", function () {

    beforeEach(function() {
        client = {
            get: jasmine.createSpy("get"),
        };

        jasmine.clock().install();
        tweetSearcher = tweetSearch(client);
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    describe("getTweetsWithHashtag", function() {
        function getQueries() {
            var searchArgs = client.get.calls.allArgs().filter(function(args) {
                return args[0] === "search/tweets";
            });
            return searchArgs.map(function(args) {
                return args[1];
            });
        }

        function getLatestCallback() {
            var searchArgs = client.get.calls.mostRecent().filter(function(args) {
                return args[0] === "search/tweets";
            });
            expect(searchArgs.length).toBeGreaterThan(0);
            return searchArgs[searchArgs.length - 1][2];
        }

        it("searches for tweets with any of the specified hashtags", function() {
            var queries = getQueries();
            expect(queries.length).toEqual(1);
            expect(queries[0].q).toEqual("#bristech OR #bristech2016");
        });
    });

    describe("getTweetsWithHashtag", function() {
        function getQueries() {
            var searchArgs = client.get.calls.allArgs().filter(function(args) {
                return args[0] === "statuses/user_timeline";
            });
            return searchArgs.map(function(args) {
                return args[1];
            });
        }

        function getLatestCallback() {
            var searchArgs = client.get.calls.mostRecent().filter(function(args) {
                return args[0] === "statuses/user_timeline";
            });
            return searchArgs[searchArgs.length - 1][2];
        }

        it("searches for tweets from the user with the specified screen name", function() {
            var queries = getQueries();
            expect(queries.length).toEqual(1);
            expect(queries[0].screen_name).toEqual("bristech");
        });
    });
});

