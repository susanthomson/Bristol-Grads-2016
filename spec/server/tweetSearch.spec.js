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
            var searchArgs = client.get.calls.allArgs().filter(function(args) {
                return args[0] === "search/tweets";
            });
            expect(searchArgs.length).toBeGreaterThan(0);
            return searchArgs[searchArgs.length - 1][2];
        }

        it("searches only for tweets with any of the specified hashtags on the first query", function() {
            var queries = getQueries();
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual({q: "#bristech OR #bristech2016"});
        });

        it("performs an additional query after a 30 second delay", function() {
            jasmine.clock().tick(29999);
            expect(getQueries().length).toEqual(1);
            jasmine.clock().tick(1);
            expect(getQueries().length).toEqual(2);
        });

        it("uses the id of the most recently acquired tweet as the since_id for subsequent queries", function() {
            getLatestCallback()(null, testTweets, null);
            jasmine.clock().tick(30000);
            expect(getQueries()[1]).toEqual({
                q: "#bristech OR #bristech2016",
                since_id: 2,
            });
        });

        it("serves acquired tweets through the getTweets function", function() {
            getLatestCallback()(null, testTweets, null);
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets).toEqual(testTimeline);
        });

        it("prints an error and adds no tweets if the twitter client returns an error", function() {
            console.log = jasmine.createSpy("log");
            getLatestCallback()("Failed", null, null);
            expect(console.log).toHaveBeenCalledWith("Failed");
            console.log.and.stub();
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets.length).toEqual(0);
        });
    });

    describe("getTweetsFrom", function() {
        function getQueries() {
            var searchArgs = client.get.calls.allArgs().filter(function(args) {
                return args[0] === "statuses/user_timeline";
            });
            return searchArgs.map(function(args) {
                return args[1];
            });
        }

        function getLatestCallback() {
            var searchArgs = client.get.calls.allArgs().filter(function(args) {
                return args[0] === "statuses/user_timeline";
            });
            return searchArgs[searchArgs.length - 1][2];
        }

        it("searches only for tweets from the user with the specified screen name", function() {
            var queries = getQueries();
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual({screen_name: "bristech"});
        });

        it("performs an additional query after a 30 second delay", function() {
            jasmine.clock().tick(29999);
            expect(getQueries().length).toEqual(1);
            jasmine.clock().tick(1);
            expect(getQueries().length).toEqual(2);
        });

        it("uses the id of the most recently acquired tweet as the since_id for subsequent queries", function() {
            getLatestCallback()(null, testTimeline, null);
            jasmine.clock().tick(30000);
            expect(getQueries()[1]).toEqual({
                screen_name: "bristech",
                since_id: 2,
            });
        });

        it("serves acquired tweets through the getTweets function", function() {
            getLatestCallback()(null, testTimeline, null);
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets).toEqual(testTimeline);
        });

        it("prints an error and adds no tweets if the twitter client returns an error", function() {
            console.log = jasmine.createSpy("log");
            getLatestCallback()("Failed", null, null);
            expect(console.log).toHaveBeenCalledWith("Failed");
            console.log.and.stub();
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets.length).toEqual(0);
        });
    });
    describe("deleteTweet", function() {
        beforeEach(function() {
            tweetSearcher.setTweetStore(testTimeline);

        });
        it("getTweetStore returns the tweet store", function() {
            expect(tweetSearcher.getTweetStore()).toEqual(testTimeline);
        });

        it("deletes one tweet from the tweet store whose id is passed as parameter", function() {
            tweetSearcher.deleteTweet(1);
            expect(tweetSearcher.getTweetStore()).toEqual([{
                id: 2,
                text: "Test tweet 2",
            }]);
        });
    });
});

