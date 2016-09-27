describe("AdminController", function () {

    var $testScope;
    var $q;
    var $interval;
    var adminDashDataService;
    var tweetTextManipulationService;
    var AdminController;

    var testSuccessResponse = {
        status: 200,
        statusText: "OK"
    };
    var testUri = "http://googleLoginPage.com";

    var testMotd = "Test message of the day";

    var testSpeakers = ["Walt", "Jesse", "Hank", "Mike", "Saul"];
    var testNewSpeaker = "Gus";
    var testAddedSpeakers = ["Walt", "Jesse", "Hank", "Mike", "Saul", "Gus"];
    var testRemoveSpeaker = "Mike";
    var testRemovedSpeakers = ["Walt", "Jesse", "Hank", "Saul"];

    var testTweets = [{
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

    var testTweetData = {
        tweets: testTweets,
        updates: [{
            type: "new_tweets",
            since: new Date(),
            tag: "official",
            startIdx: 0,
        }],
    };

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;
    var deferredGetTweetsResponse;
    var deferredGetMotdResponse;
    var deferredGetLogOutResponse;
    var deferredGetSpeakersResponse;

    beforeEach(function () {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$interval_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        $interval = _$interval_;
        adminDashDataService = jasmine.createSpyObj("adminDashDataService", [
            "authenticate",
            "getAuthUri",
            "setMotd",
            "getTweets",
            "getMotd",
            "deleteTweet",
            "getSpeakers",
            "addSpeaker",
            "removeSpeaker",
            "logOut",
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
        deferredGetMotdResponse = $q.defer();
        deferredGetLogOutResponse = $q.defer();
        deferredGetSpeakersResponse = $q.defer();

        adminDashDataService.authenticate.and.returnValue(deferredAuthenticateResponse.promise);
        adminDashDataService.getAuthUri.and.returnValue(deferredGetAuthUriResponse.promise);
        adminDashDataService.getTweets.and.returnValue(deferredGetTweetsResponse.promise);
        adminDashDataService.getMotd.and.returnValue(deferredGetMotdResponse.promise);
        adminDashDataService.getSpeakers.and.returnValue(deferredGetSpeakersResponse.promise);
        adminDashDataService.logOut.and.returnValue(deferredGetLogOutResponse.promise);

        AdminController = _$controller_("AdminController", {
            $scope: $testScope,
            adminDashDataService: adminDashDataService,
            tweetTextManipulationService: tweetTextManipulationService,
            $interval: $interval,
        });
    }));

    describe("startup", function () {
        describe("when already authenticated", function () {
            beforeEach(function () {
                deferredAuthenticateResponse.resolve(testSuccessResponse);
                $testScope.$apply();
            });
            it("Calls the authenticate function in adminDashDataService", function () {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
            });
            it("Sets logged in as true when already authenticated", function () {
                expect($testScope.loggedIn).toBe(true);
            });
            it("gets tweets and sets the local values", function () {
                deferredGetTweetsResponse.resolve(testTweetData);
                $testScope.$apply();
                expect(adminDashDataService.getTweets).toHaveBeenCalled();
                expect($testScope.tweets).toEqual(testTweets);
            });
            it("get motd and sets the local value", function () {
                deferredGetMotdResponse.resolve(testMotd);
                $testScope.$apply();
                expect(adminDashDataService.getMotd).toHaveBeenCalled();
                expect($testScope.motd).toEqual(testMotd);
            });
            it("get speakers and sets the local value", function () {
                deferredGetSpeakersResponse.resolve(testSpeakers);
                $testScope.$apply();
                expect(adminDashDataService.getSpeakers).toHaveBeenCalled();
                expect($testScope.speakers).toEqual(testSpeakers);
            });
        });
        describe("when not already authenticated", function () {
            beforeEach(function () {
                deferredAuthenticateResponse.reject();
                $testScope.$apply();
                deferredGetAuthUriResponse.resolve(testUri);
                $testScope.$apply();
            });
            it("calls the authenticate and getAuthUri functions in adminDashDataService", function () {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
                expect(adminDashDataService.getAuthUri).toHaveBeenCalled();
            });
            it("sets local URI variable", function () {
                expect($testScope.loginUri).toEqual(testUri);
            });
            it("does not attempt to get tweets", function () {
                deferredGetTweetsResponse.resolve(testTweetData);
                $testScope.$apply();
                expect(adminDashDataService.getTweets).not.toHaveBeenCalled();
                expect($testScope.tweets).toEqual([]);
            });
            it("does not attempt to get motd", function () {
                deferredGetMotdResponse.resolve(testMotd);
                $testScope.$apply();
                expect(adminDashDataService.getMotd).not.toHaveBeenCalled();
                expect($testScope.motd).toEqual("");
            });
            it("does not attempt to get speakers", function () {
                deferredGetSpeakersResponse.resolve(testSpeakers);
                $testScope.$apply();
                expect(adminDashDataService.getSpeakers).not.toHaveBeenCalled();
                expect($testScope.speakers).toEqual([]);
            });
        });
    });

    describe("setMotd()", function () {

        var deferredMotdResponse;
        var testMotd = "New message of the day";

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            adminDashDataService.setMotd.and.returnValue(deferredMotdResponse.promise);
            $testScope.ctrl.motd = testMotd;
            $testScope.setMotd();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the setMotd function in the adminDashDataService", function () {
            expect(adminDashDataService.setMotd).toHaveBeenCalled();
        });

        it("clears the local value of motd", function () {
            expect($testScope.ctrl.motd).toEqual("");
        });
    });

    describe("logOut()", function () {

        beforeEach(function () {
            deferredAuthenticateResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the logOut function in the adminDashDataService", function () {
            $testScope.logOut();
            deferredGetLogOutResponse.resolve(testSuccessResponse);
            $testScope.$apply();
            expect(adminDashDataService.logOut).toHaveBeenCalled();
        });

        it("gets login URI and sets loggedIn to false", function () {
            expect($testScope.loggedIn).toBe(true);
            $testScope.logOut();
            deferredGetLogOutResponse.resolve(testSuccessResponse);
            deferredGetAuthUriResponse.resolve(testUri);
            $testScope.$apply();
            expect($testScope.loginUri).toEqual(testUri);
            expect($testScope.loggedIn).toEqual(false);
        });
    });

    describe("addSpeaker()", function () {

        var deferredSpeakerResponse;

        beforeEach(function () {
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
            $testScope.$apply();
        });

        it("calls the addSpeaker function in the adminDashDataService with the value taken from the user", function () {
            expect(adminDashDataService.addSpeaker).toHaveBeenCalled();
            expect(adminDashDataService.addSpeaker.calls.allArgs()).toEqual([[testNewSpeaker]]);
        });

        it("gets a new copy of the speakers list from the server and updates the local speakers list", function () {
            expect(adminDashDataService.getSpeakers).toHaveBeenCalledTimes(1);
            expect($testScope.speakers).toEqual(testAddedSpeakers);
        });

        it("clears the local value of the 'speaker' input field", function () {
            expect($testScope.ctrl.speaker).toEqual("");
        });
    });

    describe("removeSpeaker()", function () {

        var deferredSpeakerResponse;

        beforeEach(function () {
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
            function () {
                expect(adminDashDataService.removeSpeaker).toHaveBeenCalled();
                expect(adminDashDataService.removeSpeaker.calls.allArgs()).toEqual([[testRemoveSpeaker]]);
            }
        );

        it("gets a new copy of the speakers list from the server and updates the local speakers list", function () {
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
        it("appends new tweets received to the scope", function () {
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("uses the tweet text manipulation service to format tweets for display", function () {
            expect(tweetTextManipulationService.updateTweet).toHaveBeenCalledTimes(testTweets.length);
            expect(tweetTextManipulationService.updateTweet.calls.allArgs()).toEqual(testTweets.map(function(tweet) {
                return [tweet];
            }));
        });
        it("sets the `latestUpdateTime` property equal to the time of the latest update received", function () {
            expect(AdminController.latestUpdateTime).toEqual(testTweetData.updates[0].since);
        });
    });

});
