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
        var searchArgs;
        var callback;
        beforeEach(function() {
            searchArgs = client.get.calls.allArgs().find(function(args) {
                return args[0] === "search/tweets";
            });
            if (searchArgs) {
                callback = searchArgs[2];
            } else {
                throw "getTweetsWithHashtag not called";
            }
        });

        it("searches for tweets with any of the specified hashtags", function() {
            expect(searchArgs[1].q).toEqual("#bristech OR #bristech2016");
        });
    });

    describe("getTweetsWithHashtag", function() {
        var searchArgs;
        var callback;
        beforeEach(function() {
            searchArgs = client.get.calls.allArgs().find(function(args) {
                return args[0] === "statuses/user_timeline";
            });
            if (searchArgs) {
                callback = searchArgs[2];
            } else {
                throw "getTweetsWithHashtag not called";
            }
        });

        it("searches for tweets from the user with the specified screen name", function() {
            expect(searchArgs[1].screen_name).toEqual("bristech");
        });
    });
});

