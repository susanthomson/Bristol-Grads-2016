describe("AdminController", function () {

    var $testScope;
    var $q;
    var twitterWallAdminDataService;
    var AdminController;

    var testSuccessResponse = {
        status: 200,
        statusText: "OK"
    };
    var testUri = "http://googleLoginPage.com";

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;

    beforeEach(module("TwitterWallAdminApp"));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _twitterWallAdminDataService_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        twitterWallAdminDataService = _twitterWallAdminDataService_;

        deferredAuthenticateResponse = _$q_.defer();
        deferredGetAuthUriResponse = _$q_.defer();

        spyOn(twitterWallAdminDataService, "authenticate").and.returnValue(deferredAuthenticateResponse.promise);
        spyOn(twitterWallAdminDataService, "getAuthUri").and.returnValue(deferredGetAuthUriResponse.promise);

        AdminController = _$controller_("DashController", {
            $scope: $testScope,
            twitterWallAdminDataService: twitterWallAdminDataService
        });
    }));

    describe("on startup", function () {
        describe("when already authenticated", function () {
            it("Calls the authenticate function in twitterWallAdminDataService", function () {
                deferredAuthenticateResponse.resolve(testSuccessResponse);
                $testScope.$apply();
                expect(twitterWallAdminDataService.authenticate).toHaveBeenCalled();
            });
            it("Sets logged in as true when already authenticated", function () {
                deferredAuthenticateResponse.resolve(testSuccessResponse);
                $testScope.$apply();
                expect($testScope.loggedIn).toBe(true);
            });
        });
        describe("when not already authenticated", function () {
            it("calls the authenticate and getAuthUri functions in twitterWallAdminDataService", function () {
                deferredAuthenticateResponse.reject();
                $testScope.$apply();
                deferredGetAuthUriResponse.resolve(testUri);
                $testScope.$apply();
                expect(twitterWallAdminDataService.authenticate).toHaveBeenCalled();
                expect(twitterWallAdminDataService.getAuthUri).toHaveBeenCalled();
            });
            it("sets local URI variable", function () {
                deferredAuthenticateResponse.reject();
                $testScope.$apply();
                deferredGetAuthUriResponse.resolve(testUri);
                $testScope.$apply();
                expect($testScope.loginUri).toEqual(testUri);
            });
        });
    });

    describe("setMotd()", function () {

        var deferredMotdResponse;
        var testMotd = "New message of the day";

        beforeEach(function () {
            deferredMotdResponse = $q.defer();
            spyOn(twitterWallAdminDataService, "setMotd").and.returnValue(deferredMotdResponse.promise);
        });

        it("Calls the setMotd function in the twitterWallAdminDataService", function () {
            $testScope.ctrl.motd = "New message of the day";
            $testScope.setMotd();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
            expect(twitterWallAdminDataService.setMotd).toHaveBeenCalled();
        });

        it("Clears the local value of motd", function () {
            $testScope.ctrl.motd = testMotd;
            $testScope.setMotd();
            deferredMotdResponse.resolve(testSuccessResponse);
            $testScope.$apply();
            expect($testScope.ctrl.motd).toEqual("");
        });
    });

});
