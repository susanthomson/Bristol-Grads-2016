describe("MainController", function() {

    var $testScope;
    var $q;
    var $interval;
    var twitterWallDataService;
    var tweetTextManipulationService;
    var MainController;

    var deferredGetTweetsResponse;
    var deferredGetSpeakersResponse;

    var testSuccessResponse;
    var user1;
    var user2;
    var entities1;
    var entities2;
    var tweet1;
    var tweet2;
    var deletedTweet1;
    var blockedTweet2;
    var pinnedTweet1;
    var testTweets;
    var testDeleteTweets;
    var testBlockedTweets;
    var testPinnedTweets;
    var testSpeakers;
    var testTweetData;
    var testBlockedData;
    var testDeletedData;
    var testPinnedData;

    var testUri;

    beforeEach(function() {
        testSuccessResponse = {
            status: 200,
            statusText: "OK"
        };

        user1 = {
            name: "Test user 1",
            screen_name: "user1"
        };

        user2 = {
            name: "Test user 2",
            screen_name: "user2"
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
            text: "Test tweet 1 #hello @bristech",
            entities: entities1,
            user: user1
        };

        tweet2 = {
            id_str: "2",
            text: "Test tweet 2 www.google.com",
            entities: entities2,
            user: user2
        };

        deletedTweet1 = {
            id_str: "1",
            text: "Test tweet 1 #hello @bristech",
            entities: entities1,
            user: user1,
            deleted: true
        };

        blockedTweet2 = {
            id_str: "2",
            text: "Test tweet 2 www.google.com",
            entities: entities2,
            user: user2,
            blocked: true
        };

        pinnedTweet1 = {
            id_str: "1",
            text: "Test tweet 1 #hello @bristech",
            entities: entities1,
            user: user1,
            pinned: true
        };

        testTweets = [tweet1, tweet2];
        testDeleteTweets = [deletedTweet1, tweet2];
        testBlockedTweets = [tweet1, blockedTweet2];
        testPinnedTweets = [pinnedTweet1, tweet2];
        testSpeakers = ["Walt", "Jesse", "Hank", "Mike", "Saul"];

        testTweetData = {
            tweets: testTweets,
            updates: [{
                type: "new_tweets",
                since: new Date(),
                tag: "official",
                startIdx: 0,
            }]
        };

        testDeletedData = {
            tweets: testTweets,
            updates: [{
                type: "tweet_status",
                since: new Date(),
                status: {
                    deleted: true
                },
                id: "1"
            }]
        };

        testBlockedData = {
            tweets: testTweets,
            updates: [{
                type: "user_block",
                screen_name: "user2",
                name: "Test user 2",
                blocked: true,
            }]
        };

        testPinnedData = {
            tweets: testTweets,
            updates: [{
                type: "tweet_status",
                since: new Date(),
                status: {
                    pinned: true
                },
                id: "1"
            }]
        };

        testUri = "http://googleLoginPage.com";
    });

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function(_$rootScope_, _$controller_, _$q_, _$interval_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        $interval = _$interval_;
        twitterWallDataService = jasmine.createSpyObj("twitterWallDataService", [
            "getTweets",
            "getSpeakers",
        ]);
        tweetTextManipulationService = jasmine.createSpyObj("tweetTextManipulationService", [
            "updateTweet",
            "addHashtag",
            "addMention",
            "addUrl",
            "deleteMediaLink",
            "sortByDate",
        ]);

        deferredGetTweetsResponse = $q.defer();
        deferredGetSpeakersResponse = $q.defer();

        twitterWallDataService.getTweets.and.returnValue(deferredGetTweetsResponse.promise);
        twitterWallDataService.getSpeakers.and.returnValue(deferredGetSpeakersResponse.promise);

        MainController = _$controller_("MainController", {
            $scope: $testScope,
            twitterWallDataService: twitterWallDataService,
            tweetTextManipulationService: tweetTextManipulationService,
            $interval: $interval,
        });
    }));

    describe("startup", function() {
        it("gets tweets and sets the local values", function() {
            deferredGetTweetsResponse.resolve(testTweetData);
            $testScope.$apply();
            expect(twitterWallDataService.getTweets).toHaveBeenCalled();
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("get speakers and sets the local value", function() {
            deferredGetSpeakersResponse.resolve(testSpeakers);
            $testScope.$apply();
            expect(twitterWallDataService.getSpeakers).toHaveBeenCalled();
            expect($testScope.speakers).toEqual(testSpeakers);
        });
    });

    describe("updateTweets()", function() {
        beforeEach(function() {
            deferredGetTweetsResponse.resolve(testTweetData);
            $testScope.$apply();
        });
        it("appends new tweets received to the scope", function() {
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("uses the tweet text manipulation service to format tweets for display", function() {
            expect(tweetTextManipulationService.updateTweet).toHaveBeenCalledTimes(testTweets.length);
            expect(tweetTextManipulationService.updateTweet.calls.allArgs()).toEqual(testTweets.map(function(tweet) {
                return [tweet];
            }));
        });
        it("sets the `latestUpdateTime` property equal to the time of the latest update received", function() {
            expect(MainController.latestUpdateTime).toEqual(testTweetData.updates[0].since);
        });
    });

    describe("Flagging tweets", function() {
        it("sets the flag for pinned tweets so the display is updated", function() {
            expect($testScope.setFlagsForTweets(testTweets, testPinnedData.updates)).toEqual(testPinnedTweets);
        });
        it("sets the flag for deleted tweets so the display on the admin is updated", function() {
            expect($testScope.setFlagsForTweets(testTweets, testDeletedData.updates)).toEqual(testDeleteTweets);
        });
        it("sets the flag for blocked tweets so the display on the admin is updated", function() {
            expect($testScope.setFlagsForTweets(testTweets, testBlockedData.updates)).toEqual(testBlockedTweets);
        });
    });
});
