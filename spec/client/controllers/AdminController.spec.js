describe("AdminController", function() {

    var $testScope;
    var $q;
    var $interval;
    var adminDashDataService;
    var tweetTextManipulationService;
    var AdminController;

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;
    var deferredGetTweetsResponse;
    var deferredGetLogOutResponse;
    var deferredGetSpeakersResponse;
    var deferredBlockedUsersResponse;

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
    var testNewSpeaker;
    var testAddedSpeakers;
    var testRemoveSpeaker;
    var testRemovedSpeakers;
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
        testNewSpeaker = "Gus";
        testAddedSpeakers = ["Walt", "Jesse", "Hank", "Mike", "Saul", "Gus"];
        testRemoveSpeaker = "Mike";
        testRemovedSpeakers = ["Walt", "Jesse", "Hank", "Saul"];

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
        adminDashDataService = jasmine.createSpyObj("adminDashDataService", [
            "authenticate",
            "getAuthUri",
            "getTweets",
            "deleteTweet",
            "getSpeakers",
            "addSpeaker",
            "removeSpeaker",
            "logOut",
            "blockedUsers",
            "addBlockedUser",
            "removeBlockedUser",
            "displayBlockedTweet",
        ]);
        tweetTextManipulationService = jasmine.createSpyObj("tweetTextManipulationService", [
            "updateTweet",
            "addHashtag",
            "addMention",
            "addUrl",
            "deleteMediaLink",
            "sortByDate",
        ]);

        deferredAuthenticateResponse = $q.defer();
        deferredGetAuthUriResponse = $q.defer();
        deferredGetTweetsResponse = $q.defer();
        deferredGetLogOutResponse = $q.defer();
        deferredGetSpeakersResponse = $q.defer();
        deferredBlockedUsersResponse = $q.defer();

        adminDashDataService.authenticate.and.returnValue(deferredAuthenticateResponse.promise);
        adminDashDataService.getAuthUri.and.returnValue(deferredGetAuthUriResponse.promise);
        adminDashDataService.getTweets.and.returnValue(deferredGetTweetsResponse.promise);
        adminDashDataService.getSpeakers.and.returnValue(deferredGetSpeakersResponse.promise);
        adminDashDataService.logOut.and.returnValue(deferredGetLogOutResponse.promise);
        adminDashDataService.blockedUsers.and.returnValue(deferredBlockedUsersResponse.promise);
        adminDashDataService.addBlockedUser.and.returnValue(deferredBlockedUsersResponse.promise);
        adminDashDataService.removeBlockedUser.and.returnValue(deferredBlockedUsersResponse.promise);

        AdminController = _$controller_("AdminController", {
            $scope: $testScope,
            adminDashDataService: adminDashDataService,
            tweetTextManipulationService: tweetTextManipulationService,
            $interval: $interval,
        });
    }));

    describe("startup", function() {
        describe("when already authenticated", function() {
            beforeEach(function() {
                deferredAuthenticateResponse.resolve(testSuccessResponse);
                $testScope.$apply();
            });
            it("Calls the authenticate function in adminDashDataService", function() {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
            });
            it("Sets logged in as true when already authenticated", function() {
                expect($testScope.loggedIn).toBe(true);
            });
            it("gets tweets and sets the local values", function() {
                deferredGetTweetsResponse.resolve(testTweetData);
                $testScope.$apply();
                expect(adminDashDataService.getTweets).toHaveBeenCalled();
                expect($testScope.tweets).toEqual(testTweets);
            });
            it("get speakers and sets the local value", function() {
                deferredGetSpeakersResponse.resolve(testSpeakers);
                $testScope.$apply();
                expect(adminDashDataService.getSpeakers).toHaveBeenCalled();
                expect($testScope.speakers).toEqual(testSpeakers);
            });
        });
        describe("when not already authenticated", function() {
            beforeEach(function() {
                deferredAuthenticateResponse.reject();
                $testScope.$apply();
                deferredGetAuthUriResponse.resolve(testUri);
                $testScope.$apply();
            });
            it("calls the authenticate and getAuthUri functions in adminDashDataService", function() {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
                expect(adminDashDataService.getAuthUri).toHaveBeenCalled();
            });
            it("sets local URI variable", function() {
                expect($testScope.loginUri).toEqual(testUri);
            });
            it("does not attempt to get tweets", function() {
                deferredGetTweetsResponse.resolve(testTweetData);
                $testScope.$apply();
                expect(adminDashDataService.getTweets).not.toHaveBeenCalled();
                expect($testScope.tweets).toEqual([]);
            });
            it("does not attempt to get speakers", function() {
                deferredGetSpeakersResponse.resolve(testSpeakers);
                $testScope.$apply();
                expect(adminDashDataService.getSpeakers).not.toHaveBeenCalled();
                expect($testScope.speakers).toEqual([]);
            });
        });
    });

    describe("logOut()", function() {

        beforeEach(function() {
            deferredAuthenticateResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the logOut function in the adminDashDataService", function() {
            $testScope.logOut();
            deferredGetLogOutResponse.resolve(testSuccessResponse);
            $testScope.$apply();
            expect(adminDashDataService.logOut).toHaveBeenCalled();
        });

        it("gets login URI and sets loggedIn to false", function() {
            expect($testScope.loggedIn).toBe(true);
            $testScope.logOut();
            deferredGetLogOutResponse.resolve(testSuccessResponse);
            deferredGetAuthUriResponse.resolve(testUri);
            $testScope.$apply();
            expect($testScope.loginUri).toEqual(testUri);
            expect($testScope.loggedIn).toEqual(false);
        });
    });

    describe("getBlockedUsers()", function() {

        var blockedUsers = ["a", "b"];

        beforeEach(function() {
            $testScope.getBlockedUsers();
            deferredBlockedUsersResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the blockedUsers() function in the adminDashDataService", function() {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

    describe("displayBlockedTweet()", function() {

        beforeEach(function() {
            $testScope.displayBlockedTweet("1");
        });

        it("calls the displayBlockedTweet() function in the adminDashDataService", function() {
            expect(adminDashDataService.displayBlockedTweet).toHaveBeenCalled();
        });
    });

    describe("addBlockedUser()", function() {
        var blockedUsers = ["a", "b"];

        beforeEach(function() {
            $testScope.addBlockedUser();
            deferredBlockedUsersResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the addBlockedUser() function in the adminDashDataService", function() {
            expect(adminDashDataService.addBlockedUser).toHaveBeenCalled();
        });
        it("calls the blockedUsers() function in the adminDashDataService", function() {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

    describe("removeBlockedUser()", function() {
        var blockedUsers = ["a", "b"];

        beforeEach(function() {
            $testScope.removeBlockedUser();
            deferredBlockedUsersResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the removeBlockedUser() function in the adminDashDataService", function() {
            expect(adminDashDataService.removeBlockedUser).toHaveBeenCalled();
        });
        it("calls the blockedUsers() function in the adminDashDataService", function() {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

    describe("addSpeaker()", function() {

        var deferredSpeakerResponse;

        beforeEach(function() {
            // Setup
            deferredSpeakerResponse = $q.defer();
            deferredSpeakerResponse.resolve();
            adminDashDataService.addSpeaker.and.returnValue(deferredSpeakerResponse.promise);
            adminDashDataService.getSpeakers.and.returnValues(deferredGetSpeakersResponse.promise);
            deferredGetSpeakersResponse.resolve(testAddedSpeakers);
            // Events
            $testScope.ctrl.speaker = testNewSpeaker;
            $testScope.addSpeaker();
            $testScope.$apply();
        });

        it("calls the addSpeaker function in the adminDashDataService with the value taken from the user", function() {
            expect(adminDashDataService.addSpeaker).toHaveBeenCalled();
            expect(adminDashDataService.addSpeaker.calls.allArgs()).toEqual([
                [testNewSpeaker]
            ]);
        });

        it("gets a new copy of the speakers list from the server and updates the local speakers list", function() {
            expect(adminDashDataService.getSpeakers).toHaveBeenCalledTimes(1);
            expect($testScope.speakers).toEqual(testAddedSpeakers);
        });

        it("clears the local value of the 'speaker' input field", function() {
            expect($testScope.ctrl.speaker).toEqual("");
        });
    });

    describe("removeSpeaker()", function() {

        var deferredSpeakerResponse;

        beforeEach(function() {
            // Setup
            deferredSpeakerResponse = $q.defer();
            deferredSpeakerResponse.resolve();
            adminDashDataService.removeSpeaker.and.returnValue(deferredSpeakerResponse.promise);
            adminDashDataService.getSpeakers.and.returnValues(deferredGetSpeakersResponse.promise);
            deferredGetSpeakersResponse.resolve(testRemovedSpeakers);
            // Events
            $testScope.removeSpeaker(testRemoveSpeaker);
            $testScope.$apply();
        });

        it("calls the removeSpeaker function in the adminDashDataService with the value passed as an argument",
            function() {
                expect(adminDashDataService.removeSpeaker).toHaveBeenCalled();
                expect(adminDashDataService.removeSpeaker.calls.allArgs()).toEqual([
                    [testRemoveSpeaker]
                ]);
            }
        );

        it("gets a new copy of the speakers list from the server and updates the local speakers list", function() {
            expect(adminDashDataService.getSpeakers).toHaveBeenCalledTimes(1);
            expect($testScope.speakers).toEqual(testRemovedSpeakers);
        });
    });

    describe("updateTweets()", function() {
        beforeEach(function() {
            deferredAuthenticateResponse.resolve(testSuccessResponse);
            $testScope.$apply();
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
            expect(AdminController.latestUpdateTime).toEqual(testTweetData.updates[0].since);
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
