describe("MainController", function () {

    var $testScope;
    var $q;

    var deferredTweets;
    var deferredMotd;
    var deferredSpeakers;

    var MainController;
    var twitterWallDataService;
    var tweetTextManipulationService;

    var testTweets;
    var testTweetData;
    var testFlaggedTweets;
    var testMotd;
    var testSpeakers;
    var testPrioritisedTweets;

    beforeEach(function () {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(function () {
        testTweets = [{
            id_str: "1",
            text: "Test tweet 1 #hello @bristech",
            entities: {
                hashtags: [{
                    text: "hello"
                }],
                user_mentions: [{
                    screen_name: "bristech"
                }],
                urls: []
            },
            user: {
                name: "Test user 1",
                screen_name: "user1"
            }
        }, {
            id_str: "2",
            text: "Test tweet 2 www.google.com",
            entities: {
                hashtags: [],
                user_mentions: [],
                urls: [{
                    url: "www.google.com",
                    display_url: "google.com"
                }]
            },
            user: {
                name: "Test user 2",
                screen_name: "user2"
            }
        }];

        testTweetData = {
            tweets: testTweets,
            updates: [{
                type: "tweet_status",
                status: {
                    pinned: true
                },
                id: "2"
            }],
        };

        testFlaggedTweets = [{
            id_str: "1",
            text: "Test tweet 1 #hello @bristech",
            entities: {
                hashtags: [{
                    text: "hello"
                }],
                user_mentions: [{
                    screen_name: "bristech"
                }],
                urls: []
            },
            user: {
                name: "Test user 1",
                screen_name: "user1"
            }
        }, {
            id_str: "2",
            text: "Test tweet 2 www.google.com",
            entities: {
                hashtags: [],
                user_mentions: [],
                urls: [{
                    url: "www.google.com",
                    display_url: "google.com"
                }]
            },
            user: {
                name: "Test user 2",
                screen_name: "user2"
            },
            pinned: true
        }];

        testPrioritisedTweets = [{
            id_str: "1",
            text: "Test tweet 1 <b>#hello</b> <b>@bristech</b>",
            entities: {
                hashtags: [{
                    text: "hello"
                }],
                user_mentions: [{
                    screen_name: "bristech"
                }],
                urls: []
            },
            user: {
                name: "Test user 1",
                screen_name: "user1"
            }
        }, {
            id_str: "2",
            text: "Test tweet 2 <b>google.com</b>",
            entities: {
                hashtags: [],
                user_mentions: [],
                urls: [{
                    url: "www.google.com",
                    display_url: "google.com"
                }]
            },
            user: {
                name: "Test user 2",
                screen_name: "user2"
            },
            wallPriority: true,
            pinned: true
        }];

        testMotd = "Test message of the day";
        testSpeakers = ["Tom", "Dick", "Harry", "user2"];
    });

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _twitterWallDataService_, _tweetTextManipulationService_) {
        $testScope = _$rootScope_.$new();
        twitterWallDataService = _twitterWallDataService_;
        tweetTextManipulationService = _tweetTextManipulationService_;
        $q = _$q_;
        deferredTweets = _$q_.defer();
        deferredMotd = _$q_.defer();
        deferredSpeakers = _$q_.defer();

        spyOn(twitterWallDataService, "getTweets").and.returnValue(deferredTweets.promise);
        spyOn(twitterWallDataService, "getMotd").and.returnValue(deferredMotd.promise);
        spyOn(twitterWallDataService, "getSpeakers").and.returnValue(deferredSpeakers.promise);

        MainController = _$controller_("MainController", {
            $scope: $testScope,
            twitterWallDataService: twitterWallDataService,
            tweetTextManipulationService: tweetTextManipulationService
        });
    }));

    describe("On startup", function () {
        it("Gets an initial list of tweets from data service", function () {
            deferredTweets.resolve(testTweetData);
            $testScope.$apply();
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("Gets message of the day from data service", function () {
            deferredMotd.resolve(testMotd);
            $testScope.$apply();
            expect($testScope.motd).toEqual(testMotd);
        });
        it("Gets speaker list from data service", function () {
            deferredSpeakers.resolve(testSpeakers);
            $testScope.$apply();
            expect($testScope.speakers).toEqual(testSpeakers);
        });
    });

    describe("Flagging tweets", function () {
        it("sets the flag for pinned tweets so the display is updated", function () {
            expect($testScope.setFlagsForTweets(testTweets, testTweetData.updates)).toEqual(testFlaggedTweets);
        });
    });

    describe("Priotiry tweets", function () {
        it("sets the flag for priority tweets so the display is updated", function () {
            deferredSpeakers.resolve(testSpeakers);
            deferredTweets.resolve(testTweetData);
            $testScope.$apply();
            expect($testScope.tweets).toEqual(testPrioritisedTweets);
        });
    });

});
