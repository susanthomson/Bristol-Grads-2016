describe("MainController", function () {

    var $testScope;
    var MainController;
    var $httpMock;

    //TODO : make this look more like the objects return from the twitter API
    var testTweets = {
        tweet1 : {
            test: "Test tweet 1",
            user: "Test user 1"
        },
        tweet2 : {
            test: "Test tweet 2",
            user: "Test user 2"
        }
    };

    beforeEach(module("TwitterWallApp"));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$httpBackend_) {
        $testScope = _$rootScope_.$new();

        //Corresponds to the $http service in the actual controller
        $httpMock = _$httpBackend_;
        $httpMock
            .when("GET", "/api/tweets")
            .respond(testTweets);
        $httpMock
            .when("GET", "/api/motd")
            .respond("MOTD");

        //Passing our test scope into the controller initialisation
        MainController = _$controller_("MainController", {
            $scope: $testScope
        });
    }));

    it("Gets an initial list of tweets from the server on startup", function () {
        $httpMock.expectGET("/api/tweets");
        $httpMock.flush();
        expect($testScope.tweets).toEqual(testTweets);
    });
});
