describe("AdminController", function () {

    var $testScope;
    var $q;
    var adminDashDataService;
    var tweetTextManipulationService;
    var AdminController;

    var testSuccessResponse = {
        status: 200,
        statusText: "OK"
    };
    var testUri = "http://googleLoginPage.com";

    var testMotd = "Test message of the day";

    var user1 = {
            name: "Test user 1",
            screen_name: "user1"
        };

    var user2 = {
            name: "Test user 2",
            screen_name: "user2"
        };

    var entities1 = {
            hashtags: [{text: "hello"}],
            user_mentions: [{screen_name: "bristech"}],
            urls: []
        };

    var entities2 = {
            hashtags: [],
            user_mentions: [],
            urls: [{url: "www.google.com", display_url: "google.com"}]
        };

    var tweet1 = {
        id_str: "1",
        text: "Test tweet 1 #hello @bristech",
        entities: entities1,
        user: user1
    };

    var tweet2 = {
        id_str: "2",
        text: "Test tweet 2 www.google.com",
        entities: entities2,
        user: user2
    };

    var deletedTweet1 = {
        id_str: "1",
        text: "Test tweet 1 #hello @bristech",
        entities: entities1,
        user: user1,
        deleted: true
    };

    var blockedTweet2 = {
        id_str: "2",
        text: "Test tweet 2 www.google.com",
        entities: entities2,
        user: user2,
        blocked: true
    };

    var testTweets = [tweet1, tweet2];
    var testDeleteTweets = [deletedTweet1, tweet2];
    var testBlockedTweets = [deletedTweet1, blockedTweet2];

    var testTweetData = {
        tweets: testTweets,
        updates: [{
            type: "tweet_status",
            status: {
                deleted: true
            },
            id: "1"
        }]
    };

    var testBlockedData = {
        tweets: testTweets,
        updates: [{
            type: "user_block",
            screen_name: "user2",
            name: "Test user 2"
        }]
    };

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;
    var deferredGetTweetsResponse;
    var deferredGetMotdResponse;
    var deferredGetLogOutResponse;

    beforeEach(function () {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _adminDashDataService_, _tweetTextManipulationService_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        adminDashDataService = _adminDashDataService_;
        tweetTextManipulationService = _tweetTextManipulationService_;

        deferredAuthenticateResponse = _$q_.defer();
        deferredGetAuthUriResponse = _$q_.defer();
        deferredGetTweetsResponse = _$q_.defer();
        deferredGetMotdResponse = _$q_.defer();
        deferredGetLogOutResponse = $q.defer();

        spyOn(adminDashDataService, "authenticate").and.returnValue(deferredAuthenticateResponse.promise);
        spyOn(adminDashDataService, "getAuthUri").and.returnValue(deferredGetAuthUriResponse.promise);
        spyOn(adminDashDataService, "getTweets").and.returnValue(deferredGetTweetsResponse.promise);
        spyOn(adminDashDataService, "getMotd").and.returnValue(deferredGetMotdResponse.promise);
        spyOn(adminDashDataService, "logOut").and.returnValue(deferredGetLogOutResponse.promise);

        AdminController = _$controller_("AdminController", {
            $scope: $testScope,
            adminDashDataService: adminDashDataService,
            tweetTextManipulationService: tweetTextManipulationService
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
            it("sets the flag for deleted tweets so the display on the admin is updated", function () {
                expect($testScope.setDeletedFlagForDeletedTweets(testTweets, testTweetData.updates)).toEqual(testDeleteTweets);
            });
            it("sets the flag for blocked tweets so the display on the admin is updated", function () {
                expect($testScope.setBlockedFlagForBlockedTweets(testTweets, testBlockedData.updates)).toEqual(testBlockedTweets);
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
        });

    });

    describe("setMotd()", function () {

        var deferredMotdResponse;
        var testMotd = "New message of the day";

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            spyOn(adminDashDataService, "setMotd").and.returnValue(deferredMotdResponse.promise);
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

    describe("getBlockedUsers()", function () {

        var deferredMotdResponse;
        var blockedUsers = ["a", "b"];

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            spyOn(adminDashDataService, "blockedUsers").and.returnValue(deferredMotdResponse.promise);
            $testScope.getBlockedUsers();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the blockedUsers() function in the adminDashDataService", function () {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

    describe("addBlockedUser()", function () {
        var deferredMotdResponse;
        var blockedUsers = ["a", "b"];

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            spyOn(adminDashDataService, "addBlockedUser").and.returnValue(deferredMotdResponse.promise);
            spyOn(adminDashDataService, "blockedUsers").and.returnValue(deferredMotdResponse.promise);
            $testScope.addBlockedUser();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the addBlockedUser() function in the adminDashDataService", function () {
            expect(adminDashDataService.addBlockedUser).toHaveBeenCalled();
        });
        it("calls the blockedUsers() function in the adminDashDataService", function () {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

    describe("removeBlockedUser()", function () {
        var deferredMotdResponse;
        var blockedUsers = ["a", "b"];

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            spyOn(adminDashDataService, "removeBlockedUser").and.returnValue(deferredMotdResponse.promise);
            spyOn(adminDashDataService, "blockedUsers").and.returnValue(deferredMotdResponse.promise);
            $testScope.removeBlockedUser();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
        });

        it("calls the removeBlockedUser() function in the adminDashDataService", function () {
            expect(adminDashDataService.removeBlockedUser).toHaveBeenCalled();
        });
        it("calls the blockedUsers() function in the adminDashDataService", function () {
            expect(adminDashDataService.blockedUsers).toHaveBeenCalled();
        });
    });

});
