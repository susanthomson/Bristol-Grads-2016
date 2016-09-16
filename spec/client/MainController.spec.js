describe("Client", function () {

    var testScope;
    var MainController;

    beforeEach(module("TwitterWallApp"));

    beforeEach(inject(function (_$rootScope_, _$controller_) {
        //Making a new scope for testing
        testScope = _$rootScope_.$new();
        MainController = _$controller_("MainController", {
            $scope: testScope
        });
    }));

    describe("MainController", function () {

        it("should return true", function () {
            expect(testScope.tweets.length).toBe(2);
        });
    });
});
