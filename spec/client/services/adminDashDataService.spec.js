describe("adminDashDataService", function() {

    var adminDashDataService;
    var $httpMock;

    var testUri = "http://localhost/";
    var testUriResponse = {
        uri: testUri
    };

    var testId = 1;

    var testEmail;

    var adminConfig = ["jim@gmail.com", "joe@gmail.com"];

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function(_adminDashDataService_, _$httpBackend_) {
        adminDashDataService = _adminDashDataService_;
        //Corresponds to the $http service in the actual data service
        $httpMock = _$httpBackend_;
        $httpMock
            .when("GET", "/admin")
            .respond(200, "");
        $httpMock
            .when("POST", "/admin/logout")
            .respond(200, "");
        $httpMock
            .when("GET", "/api/oauth/uri")
            .respond(testUriResponse);
        $httpMock
            .when("POST", "/api/tweets/delete")
            .respond(200, "");
        $httpMock
            .when("POST", "/admin/tweets/pin")
            .respond(200, "");
        $httpMock
            .when("GET", "/admin/blocked")
            .respond([]);
        $httpMock
            .when("GET", "/api/speakers")
            .respond([]);
        $httpMock
            .when("POST", "/admin/tweets/retweetDisplayStatus")
            .respond(200, "");
        $httpMock
            .when("POST", "/admin/tweets/approvedTweetsOnlyStatus")
            .respond(200, "");
        $httpMock
            .when("GET", "/admin/tweets/approvedTweetsOnlyStatus")
            .respond(200, {
                status: true
            });
        $httpMock
            .when("GET", "/admin/administrators")
            .respond(adminConfig);
        $httpMock
            .when("PUT", "/admin/administrators")
            .respond(200, "");
        $httpMock
            .whenRoute("DELETE", "/admin/administrators/:email")
            .respond(function(method, url, data, headers, params) {
                testEmail = params.email;
                return [200, ""];
            });
    }));

    describe("authenticate", function() {
        it("returns a promise which resolves when authenticate is called and the server accepts",
            function(done) {
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
            function(done) {
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

    describe("logOut", function() {
        it("returns a promise which resolves when logOut is called and the server accepts",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/logout");
                adminDashDataService.logOut().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(false);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when authenticate is called and the server rejects",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/logout").respond(500, "");
                adminDashDataService.logOut().catch(failed).then(function(result) {
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
            function(done) {
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
            function(done) {
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

    describe("setDeletedStatus", function() {
        it("sends a post request to the /admin/tweets/delete endpoint with the id and status requested",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/delete").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        id: testId,
                        deleted: true,
                    });
                    return [200, ""];
                });
                adminDashDataService.setDeletedStatus(testId, true).catch(failed).then(function() {
                    expect(failed).not.toHaveBeenCalled();
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when deleteTweet is called and the server rejects",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/delete").respond(500, "");
                adminDashDataService.setDeletedStatus(testId, true).catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("addBlockedUsers", function() {
        it("sends a post request to the /admin/blocked/add endpoint with the name requested",
            function(done) {
                $httpMock.expectPOST("/admin/blocked/add").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        user: {
                            name: "name",
                            screen_name: "screen_name"
                        }
                    });
                    return [200, ""];
                });
                adminDashDataService.addBlockedUser("name", "screen_name").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when addBlockedUser is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/blocked/add").respond(500, "");
                adminDashDataService.addBlockedUser("name", "screen_name").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("removeBlockedUsers", function() {
        it("sends a post request to the /admin/blocked/remove endpoint with the name requested",
            function(done) {
                $httpMock.expectPOST("/admin/blocked/remove").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        user: "name"
                    });
                    return [200, ""];
                });
                adminDashDataService.removeBlockedUser("name").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when removeBlockedUser is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/blocked/remove").respond(500, "");
                adminDashDataService.removeBlockedUser("name").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getBlockedUsers", function() {
        it("returns a promise which resolves with the array of blocked users sent by the server when blockedUsers() is called",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/blocked");
                adminDashDataService.blockedUsers().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual([]);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when blockedUsers() is called and the server returns an error code",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/blocked").respond(500, "");
                adminDashDataService.blockedUsers().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("displayBlockedTweet", function() {
        it("sends a post request to the /admin/blocked/display endpoint with the id requested",
            function(done) {
                $httpMock.expectPOST("/admin/blocked/display").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        id: "1"
                    });
                    return [200, ""];
                });
                adminDashDataService.displayBlockedTweet("1").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when displayBlockedTweet is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/blocked/display").respond(500, "");
                adminDashDataService.displayBlockedTweet("1").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("setPinnedStatus", function() {
        it("sends a post request to the /admin/tweets/pin endpoint with the id and status requested",
            function(done) {
                $httpMock.expectPOST("/admin/tweets/pin").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        id: testId,
                        pinned: true
                    });
                    return [200, ""];
                });
                adminDashDataService.setPinnedStatus(testId, true).finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when pin is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/pin").respond(500, "");
                adminDashDataService.setPinnedStatus(testId, true).catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("setRetweetDisplayStatus", function() {
        it("sends a post request to the /admin/tweets/retweetDisplayStatus endpoint with the id and status requested",
            function(done) {
                $httpMock.expectPOST("/admin/tweets/retweetDisplayStatus").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        status: "all",
                    });
                    return [200, ""];
                });
                adminDashDataService.setRetweetDisplayStatus("all").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when status change is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/retweetDisplayStatus").respond(500, "");
                adminDashDataService.setRetweetDisplayStatus("all").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("setApprovedTweetsOnlyStatus", function() {
        it("sends a post request to the /admin/tweets/approvedTweetsOnlyStatus endpoint with the status requested",
            function(done) {
                $httpMock.expectPOST("/admin/tweets/approvedTweetsOnlyStatus").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        status: true,
                    });
                    return [200, ""];
                });
                adminDashDataService.setApprovedTweetsOnlyStatus(true).finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when status change is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/approvedTweetsOnlyStatus").respond(500, "");
                adminDashDataService.setApprovedTweetsOnlyStatus(true).catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getApprovedTweetsOnlyStatus", function() {
        it("returns a promise which resolves with a status object",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/tweets/approvedTweetsOnlyStatus");
                adminDashDataService.getApprovedTweetsOnlyStatus().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual({
                        status: true
                    });
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getApprovedTweetsOnlyStatus() is called and the server returns an error code",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/tweets/approvedTweetsOnlyStatus").respond(500, "");
                adminDashDataService.getApprovedTweetsOnlyStatus().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("addSpeaker", function() {
        it("sends a post request to the /admin/blocked/add endpoint with the name requested",
            function(done) {
                $httpMock.expectPOST("/admin/speakers/add").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        name: "name"
                    });
                    return [200, ""];
                });
                adminDashDataService.addSpeaker("name", "screen_name").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when addBlockedUser is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/speakers/add").respond(500, "");
                adminDashDataService.addSpeaker("name").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("removeSpeaker", function() {
        it("sends a post request to the /admin/speakers/remove endpoint with the name requested",
            function(done) {
                $httpMock.expectPOST("/admin/speakers/remove").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        name: "name"
                    });
                    return [200, ""];
                });
                adminDashDataService.removeSpeaker("name").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when removeSpeaker is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/speakers/remove").respond(500, "");
                adminDashDataService.removeSpeaker("name").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getSpeakers", function() {
        it("returns a promise which resolves with the array of speakers sent by the server when getSpeakers() is called",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/speakers");
                adminDashDataService.getSpeakers().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual([]);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getSpeakers() is called and the server returns an error code",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/api/speakers").respond(500, "");
                adminDashDataService.getSpeakers().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("deletePictureFromTweet", function() {
        it("sends a post request to the /admin/tweets/hide_image endpoint with the id requested",
            function(done) {
                $httpMock.expectPOST("/admin/tweets/hide_image").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        id: "id"
                    });
                    return [200, ""];
                });
                adminDashDataService.deletePictureFromTweet("id").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when deletePictureFromTweet is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPOST("/admin/tweets/hide_image").respond(500, "");
                adminDashDataService.deletePictureFromTweet("id").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(500);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("getAdmins", function() {
        it("returns a promise which resolves with the admin config sent by the server when getAdmins is called",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/administrators");
                adminDashDataService.getAdmins().catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(false);
                    expect(result).toEqual(adminConfig);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when getAdmins is called and the server rejects",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectGET("/admin/administrators").respond(404, "");
                adminDashDataService.getAdmins("").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(404);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("addAdmin", function() {
        it("sends a put request to the /admin/administrators endpoint with the email requested",
            function(done) {
                $httpMock.expectPUT("/admin/administrators").respond(function(method, url, data, headers, params) {
                    expect(JSON.parse(data)).toEqual({
                        email: "newadmin@gmail.com"
                    });
                    return [200, ""];
                });
                adminDashDataService.addAdmin("newadmin@gmail.com").finally(function() {
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when addAdmin is called and the server rejects",

            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectPUT("/admin/administrators").respond(404, "");
                adminDashDataService.addAdmin("newadmin@gmail.com").catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(404);
                    done();
                });
                $httpMock.flush();
            }
        );
    });

    describe("removeAdmin", function() {
        var email = "oldadmin@gmail.com";

        it("sends a delete request to the /admin/administrators/ endpoint with the email requested",
            function(done) {
                adminDashDataService.removeAdmin(email).finally(function() {
                    expect(testEmail).toEqual(email);
                    done();
                });
                $httpMock.flush();
            }
        );

        it("returns a promise which rejects when removeAdmin is called and the server rejects",
            function(done) {
                var failed = jasmine.createSpy("failed");
                $httpMock.expectDELETE("/admin/administrators/" + email).respond(404, "");
                adminDashDataService.removeAdmin(email).catch(failed).then(function(result) {
                    expect(failed.calls.any()).toEqual(true);
                    expect(failed.calls.argsFor(0)[0].status).toEqual(404);
                    done();
                });
                $httpMock.flush();
            }
        );
    });
});
