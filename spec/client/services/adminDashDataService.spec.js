describe("adminDashDataService", function () {

    var adminDashDataService;
    var $httpMock;

    var testUri = "http://localhost/";
    var testUriResponse = {
        uri: testUri
    };

    var testMotd = "MOTD";

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
    }));

    describe("authenticate", function() {
        it("returns a promise which resolves when authenticate is called and the server accepts",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin");
                adminDashDataService.authenticate().catch(failed).then(function(result) {
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
                adminDashDataService.authenticate().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getAuthUri", function() {
        it("returns a promise which resolves with the URI sent by the server when getAuthUri is called",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/oauth/uri");
                adminDashDataService.getAuthUri().catch(failed).then(function(result) {
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
                adminDashDataService.getAuthUri().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("setMotd", function() {
        it("sends a post request to the /admin/motd endpoint with the message requested",
            function (done) {
                $httpMock.expectPOST("/admin/motd").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({motd: testMotd});
                    return [200, ""];
                });
                adminDashDataService.setMotd(testMotd).finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which resolves when setMotd is called and the server accepts",
            function (done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/motd");
                adminDashDataService.setMotd(testMotd).catch(failed).then(function(result) {
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
                adminDashDataService.setMotd(testMotd).catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

});

