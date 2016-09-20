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

    var deferredAuthenticateResponse;
    var deferredGetAuthUriResponse;

    beforeEach(module("TwitterWallAdminApp"));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _adminDashDataService_) {
        $testScope = _$rootScope_.$new();
        $q = _$q_;
        adminDashDataService = _adminDashDataService_;

        deferredAuthenticateResponse = _$q_.defer();
        deferredGetAuthUriResponse = _$q_.defer();

        spyOn(adminDashDataService, "authenticate").and.returnValue(deferredAuthenticateResponse.promise);
        spyOn(adminDashDataService, "getAuthUri").and.returnValue(deferredGetAuthUriResponse.promise);

        AdminController = _$controller_("DashController", {
            $scope: $testScope,
            adminDashDataService: adminDashDataService
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

});
