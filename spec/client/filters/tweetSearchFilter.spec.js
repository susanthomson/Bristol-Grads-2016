describe("tweetSearchFilter", function() {
    var tweetSearchFilter;

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    var user1;
    var user2;
    var entities1;
    var entities2;
    var tweet1;
    var tweet2;
    var tweets;

    function initValues() {
        user1 = {
            name: "Tester1",
            screen_name: "user1_screen_name"
        };

        user2 = {
            name: "Tester2",
            screen_name: "user2_screen_name"
        };

        entities1 = {
            hashtags: [{
                text: "hello"
            }],
            user_mentions: [{
                screen_name: "bristech"
            }],
            urls: []
        };

        entities2 = {
            hashtags: [],
            user_mentions: [],
            urls: [{
                url: "www.google.com",
                display_url: "google.com"
            }]
        };

        tweet1 = {
            id_str: "1",
            full_text: "RT Test tweet 1 #hello @bristech",
            entities: entities1,
            user: user1,
            retweeted_status: {
                id_str: "5",
                full_text: "Test tweet 1 #hello @bristech",
                entities: entities1,
                user: user2,
            },
            favorite_count: 0,
            retweet_count: 0,
            displayText: "RT Test tweet 1 #hello @bristech"
        };

        tweet2 = {
            id_str: "2",
            full_text: "Test tweet 2 www.google.com",
            entities: entities2,
            user: user2,
            favorite_count: 0,
            retweet_count: 0,
            displayText: "Test tweet 2 www.google.com"
        };

        tweets = [tweet1, tweet2];
    }

    beforeEach(initValues);

    beforeEach(inject(function(_tweetSearchFilterFilter_) {
        tweetSearchFilter = _tweetSearchFilterFilter_;
    }));

    describe("Filtering of tweets on search", function() {
        it("No search query returns original list", function() {
            expect(tweetSearchFilter(tweets, "")).toEqual(tweets);
        });
        it("Returns tweets with matching screen name", function() {
            expect(tweetSearchFilter(tweets, "user1_screen_name")).toEqual([tweet1]);
        });
        it("Returns tweets with matching display name", function() {
            expect(tweetSearchFilter(tweets, "Tester2")).toEqual([tweet2]);
        });
        it("Returns tweets with matching displayText", function() {
            expect(tweetSearchFilter(tweets, "Test tweet 1 #hello @bristech")).toEqual([tweet1]);
        });
        it("Display text searches are case insensitive", function() {
            expect(tweetSearchFilter(tweets, "TEST TWEET 2")).toEqual([tweet2]);
        });
    });

    if (!String.prototype.includes) {
        String.prototype.includes = function() {
            "use strict";
            return String.prototype.indexOf.apply(this, arguments) !== -1;
        };
    }
});
