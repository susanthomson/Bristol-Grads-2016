var tweetSearch = require("../../server/tweetSearch.js");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var tweetSearcher;
var client;
var getTweets;

var testTimeline = [{
    id: 1,
    id_str: "1",
    text: "Test tweet 1",
}, {
    id: 2,
    id_str: "2",
    text: "Test tweet 2",
}];

var testTweets = {
    statuses: testTimeline,
};

var testResponseOk = {
    headers: {
        "x-rate-limit-remaining": 180,
        "x-rate-limit-reset": 0,
    }
};

var testResponseDepleted = {
    headers: {
        "x-rate-limit-remaining": 0,
        "x-rate-limit-reset": 0,
    }
};

var testInitialResourceProfiles = {
    resources: {
        "search": {
            "/search/tweets": {
                remaining: 180,
                reset: 0,
            },
        },
        "statuses": {
            "/statuses/user_timeline": {
                remaining: 180,
                reset: 0,
            },
        },
    },
};

describe("tweetSearch", function () {
    var startTime;

    function getQueries(resource) {
        var searchArgs = client.get.calls.allArgs().filter(function(args) {
            return args[0] === resource;
        });
        return searchArgs.map(function(args) {
            return args[1];
        });
    }

    function getLatestCallback(resource) {
        var searchArgs = client.get.calls.allArgs().filter(function(args) {
            return args[0] === resource;
        });
        expect(searchArgs.length).toBeGreaterThan(0);
        return searchArgs[searchArgs.length - 1][2];
    }

    beforeEach(function() {
        client = {
            get: jasmine.createSpy("get"),
        };

        jasmine.clock().install();
        startTime = new Date().getTime();
        jasmine.clock().mockDate(startTime);
        tweetSearcher = tweetSearch(client);
        getLatestCallback("application/rate_limit_status")(null, testInitialResourceProfiles, testResponseOk);
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    function resourceQueryTests(resource, defaultData) {
        it("performs an additional query after a 5 second delay", function() {
            jasmine.clock().tick(4999);
            expect(getQueries(resource).length).toEqual(1);
            jasmine.clock().tick(1);
            expect(getQueries(resource).length).toEqual(2);
        });

        it("uses the id of the most recently acquired tweet as the since_id for subsequent queries", function() {
            getLatestCallback(resource)(null, defaultData, testResponseOk);
            jasmine.clock().tick(5000);
            expect(getQueries(resource)[1].since_id).toEqual("2");
        });

        it("serves acquired tweets through the getTweets function", function() {
            getLatestCallback(resource)(null, defaultData, testResponseOk);
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets).toEqual(testTimeline);
        });

        it("prints an error and adds no tweets if the twitter client returns an error", function() {
            spyOn(console, "log");
            getLatestCallback(resource)("Failed", null, testResponseOk);
            expect(console.log).toHaveBeenCalledWith("Failed");
            var tweets = tweetSearcher.getTweetStore();
            expect(tweets.length).toEqual(0);
        });

        it("does not attempt to query the twitter api until the reset time if the rate limit has been reached",
            function() {
                var resetTime = (Math.floor(startTime / 1000) + 6) * 1000;
                var depletedResponse = testResponseDepleted;
                depletedResponse.headers["x-rate-limit-reset"] = (resetTime / 1000).toString();
                // Send response with headers indicating the app has depleted its query rate limit
                getLatestCallback(resource)(null, defaultData, depletedResponse);
                expect(getQueries(resource).length).toEqual(1);
                // Tick clock forward to the time when the tweet searcher would normally query again
                jasmine.clock().tick(5000);
                expect(getQueries(resource).length).toEqual(1);
                // Tick clock forward to the time when the tweet searcher should attempt to query again
                jasmine.clock().tick(resetTime + 1000 - (startTime + 5000));
                expect(getQueries(resource).length).toEqual(2);
            }
        );
    }

    describe("getTweetsWithHashtag", function() {
        it("searches only for tweets with any of the specified hashtags on the first query", function() {
            var queries = getQueries("search/tweets");
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual({q: "#bristech OR #bristech2016"});
        });

        resourceQueryTests("search/tweets", testTweets);
    });

    describe("getTweetsFrom", function() {
        it("searches only for tweets from the user with the specified screen name", function() {
            var queries = getQueries("statuses/user_timeline");
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual({screen_name: "bristech"});
        });

        resourceQueryTests("statuses/user_timeline", testTimeline);
    });

    describe("deleteTweet", function() {
        beforeEach(function() {
            tweetSearcher.loadTweets(testTimeline, "test");
        });
        it("getTweetStore returns the tweet store", function() {
            expect(tweetSearcher.getTweetStore()).toEqual(testTimeline);
        });

        it("deletes one tweet from the tweet store whose id is passed as parameter", function() {
            tweetSearcher.deleteTweet(1);
            expect(tweetSearcher.getTweetStore()).toEqual([{
                id: 2,
                id_str: "2",
                text: "Test tweet 2",
            }]);
        });
    });
});

