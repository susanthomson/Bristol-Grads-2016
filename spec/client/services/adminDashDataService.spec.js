describe("adminDashDataService", function () {

    var adminDashDataService;
    var $httpMock;

    var testUri = "http://localhost/";
    var testUriResponse = {
        uri: testUri
    };

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

    var testMotd = "MOTD";
    var testId = 1;

    beforeEach(module("TwitterWallAdminApp"));

    beforeEach(inject(function (_adminDashDataService_, _$httpBackend_) {
        adminDashDataService = _adminDashDataService_;
        //Corresponds to the $http service in the actual data service
        $httpMock = _$httpBackend_;
        $httpMock
            .when("GET", "/admin")
            .respond(200, "");
        $httpMock
            .when("GET", "/api/oauth/uri")
            .respond(testUriResponse);
        $httpMock
            .when("POST", "/admin/motd")
            .respond(200, "");
        $httpMock
            .when("POST", "/api/tweets/delete")
            .respond(200, "");
        $httpMock
            .when("GET", "/api/tweets")
            .respond(testTweets);
        $httpMock
            .when("GET", "/api/motd")
            .respond(testMotd);
    }));

    describe("authenticate", function () {
        it("returns a promise which resolves when authenticate is called and the server accepts",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin");
                adminDashDataService.authenticate().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(false);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when authenticate is called and the server rejects",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin").respond(500, "");
                adminDashDataService.authenticate().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getAuthUri", function () {
        it("returns a promise which resolves with the URI sent by the server when getAuthUri is called",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/oauth/uri");
                adminDashDataService.getAuthUri().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual(testUri);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getAuthUri is called and the server returns an error code",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/oauth/uri").respond(500, "");
                adminDashDataService.getAuthUri().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("setMotd", function () {
        it("sends a post request to the /admin/motd endpoint with the message requested",
            function (done) {
                $httpMock.expectPOST("/admin/motd").respond(function (method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        motd: testMotd
                    });
                    return [200, ""];
                });
                adminDashDataService.setMotd(testMotd).finally(function () {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which resolves when setMotd is called and the server accepts",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/motd");
                adminDashDataService.setMotd(testMotd).catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(false);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when setMotd is called and the server rejects",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/motd").respond(500, "");
                adminDashDataService.setMotd(testMotd).catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });
    describe("getTweets", function () {
        it("returns a promise which resolves with a list of the tweet objects sent by the server when getTweets is called",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/tweets");
                adminDashDataService.getTweets().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual(testTweets);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getTweets is called and the server returns an error code",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/tweets").respond(500, "");
                adminDashDataService.getTweets().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getMotd", function () {
        it("returns a promise which resolves with the MOTD sent by the server when getMotd is called",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/motd");
                adminDashDataService.getMotd().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual(testMotd);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getMotd is called and the server returns an error code",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/motd").respond(500, "");
                adminDashDataService.getMotd().catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("deleteTweet", function () {
        it("sends a post request to the /admin/tweets/delete endpoint with the id requested",
            function (done) {
                $httpMock.expectPOST("/admin/tweets/delete").respond(function (method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        id: testId
                    });
                    return [200, ""];
                });
                adminDashDataService.deleteTweet(testId).finally(function () {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when deleteTweet is called and the server rejects",

            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/delete").respond(500, "");
                adminDashDataService.deleteTweet(testId).catch(failed).then(function (result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });
});
