describe("AdminController", function () {

    var $testScope;
    var $q;
    var adminDashDataService;
    var AdminController;

    var testSuccessResponse = {
        status: 200,
        statusText: "OK"
    };
    var testUri = "http://googleLoginPage.com";

    var testMotd = "Test message of the day";

    var testTweets = [{
        text: "Test tweet 1",
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
        text: "Test tweet 2",
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

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;
    var deferredGetTweetsResponse;
    var deferredGetMotdResponse;

    beforeEach(function () {
        angular.module("ngMaterial", []);
        angular.module("ngRoute", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _adminDashDataService_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        adminDashDataService = _adminDashDataService_;

        deferredAuthenticateResponse = _$q_.defer();
        deferredGetAuthUriResponse = _$q_.defer();
        deferredGetTweetsResponse = _$q_.defer();
        deferredGetMotdResponse = _$q_.defer();

        spyOn(adminDashDataService, "authenticate").and.returnValue(deferredAuthenticateResponse.promise);
        spyOn(adminDashDataService, "getAuthUri").and.returnValue(deferredGetAuthUriResponse.promise);
        spyOn(adminDashDataService, "getTweets").and.returnValue(deferredGetTweetsResponse.promise);
        spyOn(adminDashDataService, "getMotd").and.returnValue(deferredGetMotdResponse.promise);

        AdminController = _$controller_("AdminController", {
            $scope: $testScope,
            adminDashDataService: adminDashDataService
        });
    }));

    describe("startup", function () {
        describe("when already authenticated", function () {
            beforeEach(function () {
                deferredAuthenticateResponse.resolve(testSuccessResponse);
                deferredGetTweetsResponse.resolve(testTweets);
                deferredGetMotdResponse.resolve(testMotd);
                $testScope.$apply();
            });
            xit("Calls the authenticate function in adminDashDataService", function () {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
            });
            xit("Sets logged in as true when already authenticated", function () {
                expect($testScope.loggedIn).toBe(true);
            });
            xit("gets tweets and sets the local values", function() {
                expect(adminDashDataService.getTweets).toHaveBeenCalled();
                expect($testScope.tweets).toEqual(testTweets);
            });
            xit("get motd and sets the local value", function() {
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
            xit("calls the authenticate and getAuthUri functions in adminDashDataService", function () {
                expect(adminDashDataService.authenticate).toHaveBeenCalled();
                expect(adminDashDataService.getAuthUri).toHaveBeenCalled();
            });
            xit("sets local URI variable", function () {
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

        xit("calls the setMotd function in the adminDashDataService", function () {
            expect(adminDashDataService.setMotd).toHaveBeenCalled();
        });

        xit("clears the local value of motd", function () {
            expect($testScope.ctrl.motd).toEqual("");
        });
    });

});
