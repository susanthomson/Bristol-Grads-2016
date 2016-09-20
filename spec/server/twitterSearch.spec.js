var tweetSearch = require("../../server/tweetSearch.js");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var tweetSearcher;
var client;
var getTweets;

var testTimeline = [{
    id_str: 1,
    text: "Test tweet 1",
}, {
    id_str: 2,
    text: "Test tweet 2",
}];

var testTweets = {
    statuses: testTimeline,
};

describe("tweetSearch", function () {

    beforeEach(function () {
        client = {
            get: jasmine.createSpy("get"),
        };

        tweetSearcher = tweetSearch(client);
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

    describe("deleteTweet", function() {
        beforeEach(function() {
            tweetSearcher.tweetStore = testTimeline;
        });
        it("getTweetStore returns the tweet store", function() {
            expect(tweetSearcher.getTweetStore()).toEqual(testTimeline);
        });

        it("deletes one tweet from the tweet store whose id is passed as parameter", function() {
            tweetSearcher.deleteTweet(1);
            expect(tweetSearcher.getTweetStore()).toEqual([{
                id_str: 2,
                text: "Test tweet 2",
            }]);
        });
    });
});

