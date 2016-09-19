describe("twitterWallDataService", function () {

    var twitterWallDataService;
    var $httpMock;

    //TODO : make this look more like the objects return from the twitter API
    var testTweets = [
        {
            test: "Test tweet 1",
            user: "Test user 1"
        },
        {
            test: "Test tweet 2",
            user: "Test user 2"
        },
    ];
    var testTweetResponse = {
        data: testTweets,
    };

    var testMotd = "MOTD";
    var testMotdResponse = {
        data: "MOTD",
    };

    beforeEach(module("TwitterWallApp"));

    beforeEach(inject(function (_twitterWallDataService_, _$httpBackend_) {
        twitterWallDataService = _twitterWallDataService_;
        //Corresponds to the $http service in the actual data service
        $httpMock = _$httpBackend_;
        $httpMock
            .when("GET", "/api/tweets")
            .respond(testTweets);
        $httpMock
            .when("GET", "/api/motd")
            .respond(testMotd);
    }));

    it("returns a promise which resolves with a list of the tweet objects sent by the server when getTweets is called",
        function (done) {
            var failed = jasmine.createSpy("failed");
            twitterWallDataService.getTweets().catch(failed).then(function(result) {
                $httpMock.expectGET("/api/tweets");
                expect(failed.calls.any()).toEqual(false);
                expect(result).toEqual(testTweets);
                done();
            });
            $httpMock.flush();
        }
    );

    it("returns a promise which resolves with the MOTD sent by the server when getMotd is called",
        function (done) {
            var failed = jasmine.createSpy("failed");
            twitterWallDataService.getMotd().catch(failed).then(function(result) {
                $httpMock.expectGET("/api/motd");
                expect(failed.calls.any()).toEqual(false);
                expect(result).toEqual(testMotd);
                done();
            });
            $httpMock.flush();
        }
    );

});

