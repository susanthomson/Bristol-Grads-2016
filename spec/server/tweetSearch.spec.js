var tweetSearch = require("../../server/tweetSearch.js");

var testPort = 1234;
var baseURL = "http://localhost:" + testPort;

var tweetSearcher;
var client;
var getTweets;
var fs;

var testTimeline = [{
    id: 1,
    id_str: "1",
    text: "Test tweet 1",
    user: {
        name: "bristech",
    },
}, {
    id: 2,
    id_str: "2",
    text: "Test tweet 2",
    user: {
        name: "bristech",
    },
}];

var testTimeline2 = [{
    id: 4,
    id_str: "4",
    text: "Test tweet 3",
}, {
    id: 7,
    id_str: "7",
    text: "Test tweet 4",
}];

var testTweets = {
    statuses: [{
        id: 1,
        id_str: "1",
        text: "Test tweet 1 #bristech",
        user: {
            name: "randomjoe",
        },
    }, {
        id: 2,
        id_str: "2",
        text: "Test tweet 2 #bristech",
        user: {
            name: "randomjoe",
        },
    }, {
        id: 5,
        id_str: "5",
        text: "Test tweet 3 @bristech",
        user: {
            name: "randomjoe",
        },
    }],
};

var testTweetsMixed = {
    statuses: testTweets.statuses.concat({
        id: 10,
        id_str: "10",
        text: "Test official tweet #bristech",
        user: {
            name: "bristech",
        },
    }),
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

var speakers = ["alice", "bob", "charlie"];
var speakerList = {
    speakers: speakers
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

        fs = {
            readFile: function(file, encoding, callback) {}
        };

        spyOn(fs, "readFile").and.callFake(function(file, encoding, callback) {
            callback(undefined, JSON.stringify(speakerList));
        });

        jasmine.clock().install();
        startTime = new Date().getTime();
        jasmine.clock().mockDate(startTime);
        tweetSearcher = tweetSearch(client, fs);
        getLatestCallback("application/rate_limit_status")(null, testInitialResourceProfiles, testResponseOk);
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });

    function resourceQueryTests(resource, defaultData, defaultOutput) {
        it("performs an additional query after a 5 second delay", function() {
            jasmine.clock().tick(4999);
            expect(getQueries(resource).length).toEqual(1);
            jasmine.clock().tick(1);
            expect(getQueries(resource).length).toEqual(2);
        });

        it("uses the id of the most recently acquired tweet as the since_id for subsequent queries", function() {
            getLatestCallback(resource)(null, defaultData, testResponseOk);
            jasmine.clock().tick(5000);
            expect(getQueries(resource)[1].since_id).toEqual(defaultOutput[defaultOutput.length - 1].id_str);
        });

        it("serves acquired tweets through the getTweets function", function() {
            getLatestCallback(resource)(null, defaultData, testResponseOk);
            var tweetData = tweetSearcher.getTweetData();
            expect(tweetData.tweets).toEqual(defaultOutput);
        });

        it("prints an error and adds no tweets if the twitter client returns an error", function() {
            spyOn(console, "log");
            getLatestCallback(resource)("Failed", null, testResponseOk);
            expect(console.log).toHaveBeenCalledWith("Failed");
            var tweetData = tweetSearcher.getTweetData();
            expect(tweetData.tweets.length).toEqual(0);
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
            expect(queries[0]).toEqual({q: "#bristech OR #bristech2016 OR @bristech"});
        });

        resourceQueryTests("search/tweets", testTweets, testTweets.statuses);

        it("does not save tweets that belong to a higher-priority tweet category", function () {
            getLatestCallback("search/tweets")(null, testTweetsMixed, testResponseOk);
            var tweetData = tweetSearcher.getTweetData();
            expect(tweetData.tweets).toEqual(testTweets.statuses);
        });
    });

    describe("getTweetsFrom", function() {
        it("searches only for tweets from the user with the specified screen name", function() {
            var queries = getQueries("statuses/user_timeline");
            expect(queries.length).toEqual(1);
            expect(queries[0]).toEqual({screen_name: "bristech"});
        });

        resourceQueryTests("statuses/user_timeline", testTimeline, testTimeline);
    });

    describe("getTweetData", function() {
        var testTweetData;
        var secondUpdateTime;

        beforeEach(function() {
            testTweetData = {
                tweets: testTimeline.concat(testTimeline2),
                updates: [],
            };
            tweetSearcher.loadTweets(testTimeline, "test");
            testTweetData.updates.push({
                type: "new_tweets",
                since: new Date(),
                tag: "test",
                startIdx: 0,
            });
            jasmine.clock().tick(5000);
            tweetSearcher.loadTweets(testTimeline2, "test");
            secondUpdateTime = new Date();
            testTweetData.updates.push({
                type: "new_tweets",
                since: secondUpdateTime,
                tag: "test",
                startIdx: 2,
            });
        });

        it("returns all undeleted tweets in the timeline when given no since argument", function() {
            expect(tweetSearcher.getTweetData()).toEqual(testTweetData);
        });

        it("returns only updates that occurred after the time given by the `since` argument", function() {
            var beforeSecondUpdate = tweetSearcher.getTweetData(new Date(secondUpdateTime.getTime() - 1));
            expect(beforeSecondUpdate.tweets).toEqual(testTimeline2);
            expect(beforeSecondUpdate.updates).toEqual([testTweetData.updates[1]]);
            var atSecondUpdate = tweetSearcher.getTweetData(secondUpdateTime);
            expect(atSecondUpdate.tweets).toEqual([]);
            expect(atSecondUpdate.updates).toEqual([]);
        });

        describe("with deleted tweets", function() {
            var deletedTweetData;

            beforeEach(function() {
                deletedTweetData = {
                    tweets: testTweetData.tweets.slice(),
                    updates: testTweetData.updates.slice(),
                };
                jasmine.clock().tick(500);
                tweetSearcher.deleteTweet("2");
                var deleteDateTime = new Date();
                deletedTweetData.updates.push({
                    type: "tweet_status",
                    since: deleteDateTime,
                    id: "2",
                    status: {
                        deleted: true,
                    },
                });
                deletedTweetData.tweets.splice(1, 1);
            });

            it("does not return tweets that have been deleted", function() {
                expect(tweetSearcher.getTweetData().tweets).toEqual(deletedTweetData.tweets);
            });

            it("adds an update noting the deleted tweet to its output when a tweet is deleted", function() {
                expect(tweetSearcher.getTweetData().updates).toEqual(deletedTweetData.updates);
            });

            it("returns tweets that have been deleted if `includeDeleted` is passed as true", function() {
                expect(tweetSearcher.getTweetData(undefined, true).tweets).toEqual(testTweetData.tweets);
            });
        });
    });

    describe("deleteTweet", function() {
        beforeEach(function() {
            tweetSearcher.loadTweets(testTimeline, "test");
        });

        it("does not serve tweets that have been deleted via deleteTweet", function() {
            expect(tweetSearcher.getTweetData().tweets).toEqual(testTimeline);
            tweetSearcher.deleteTweet("1");
            expect(tweetSearcher.getTweetData().tweets).toEqual([{
                id: 2,
                id_str: "2",
                text: "Test tweet 2",
                user: {
                    name: "bristech",
                },
            }]);
        });
    });

    describe("getSpeakers", function() {
        it("returns speakers read in from file", function() {
            expect(tweetSearcher.getSpeakers()).toEqual(speakers);
        });
    });
});

