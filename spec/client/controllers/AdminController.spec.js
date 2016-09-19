describe("AdminController", function () {

    var $testScope;
    var $q;

    var testResponse = {
        status: 200,
        statusText: "OK"
    };

    var deferredAuthenticateResponse;

    var AdminController;
    var twitterWallAdminDataService;

    beforeEach(module("TwitterWallAdminApp"));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, twitterWallAdminDataService) {
        $testScope = _$rootScope_.$new();

        $q = _$q_;
        deferredAuthenticateResponse = _$q_.defer();

        spyOn(twitterWallAdminDataService, "authenticate").and.returnValue(deferredAuthenticateResponse.promise);

        AdminController = _$controller_("DashController", {
            $scope: $testScope,
            twitterWallAdminDataService: twitterWallAdminDataService
        });
    }));

    describe("On startup", function() {
        it("Sets logged in as true when authenticated", function () {
            deferredAuthenticateResponse.resolve(testResponse);
            $testScope.$apply();
            expect($testScope.loggedIn).toBe(true);
        });
    });

});
