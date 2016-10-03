describe("tweetColumn", function() {
    var $compile;
    var $testScope;
    var $httpMock;
    var directiveElement;

    function getCompileString(position) {
        return "<tweet-column " +
            "position='" + position + "' " +
            "tweets='tweets' " +
            "admin='loggedIn' " +
            "set-deleted-status='setDeletedStatus(id, status)' " +
            "add-blocked-user='addBlockedUser(name, screen_name)' " +
            "set-pinned-status='setPinnedStatus(id, status)' " +
            "></tweet-column>";
    }

    // Returns a set of tweets featuring every possible combination of boolean tweet properties
    function generateTweets() {
        var tweetPropKeys = ["deleted", "blocked", "pinned", "wallPriority", "displayed"];
        var tweetProps = {};
        tweetPropKeys.forEach(function(prop) {
            tweetProps[prop] = true;
        });
        var tweets = [];
        for (var id = 0; id < Math.pow(2, tweetPropKeys.length); id++) {
            var tweet = {
                id: id.toString(),
            };
            tweetPropKeys.forEach(function(prop, idx) {
                // Flip the n-th tweet property's value every 2^n iterations
                tweetProps[prop] = id % Math.pow(2, idx) === 0 ? !tweetProps[prop] : tweetProps[prop];
                tweet[prop] = tweetProps[prop];
            });
            tweets.push(tweet);
        }
        return tweets;
    }

    var testTweets = generateTweets();

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function(_$rootScope_, _$compile_, _$httpBackend_) {
        $testScope = _$rootScope_.$new();
        $testScope.tweets = testTweets;
        $testScope.setDeletedStatus = jasmine.createSpy("setDeletedStatus");
        $testScope.addBlockedUser = jasmine.createSpy("addBlockedUser");
        $testScope.setPinnedStatus = jasmine.createSpy("setPinnedStatus");
        $compile = _$compile_;
        $httpMock = _$httpBackend_;
    }));

    describe("Tweet Filtering", function() {
        var getTweets;
        var filteredTweets;
        var displayableTweets = testTweets.filter(function(tweet) {
            return !(tweet.deleted || tweet.blocked);
        });

        // Technically this is only testing the test, but is necessary to ensure the following tests are correct
        it("should initially filter deleted or blocked tweets", function() {
            testTweets.forEach(function(tweet) {
                if (tweet.deleted || tweet.blocked) {
                    expect(displayableTweets).not.toContain(tweet);
                }
            });
        });

        function getPretestSetup(position) {
            return function() {
                directiveElement = $compile(getCompileString(position))($testScope);
                $httpMock.expectGET("templates/tweet-column-" + position + ".html").respond(200, "");
                $testScope.$digest();
                $httpMock.flush();
                filteredTweets = directiveElement.isolateScope().getTweets();
            }
        }

        describe("Left", function() {
            beforeEach(getPretestSetup("left"));

            it("only displays tweets that are pinned", function() {
                expect(filteredTweets).toEqual(displayableTweets.filter(function(tweet) {
                    return tweet.pinned;
                }));
            });
        });

        describe("Middle", function() {
            beforeEach(getPretestSetup("middle"));

            it("only displays tweets that are not pinned or prioritised", function() {
                expect(filteredTweets).toEqual(displayableTweets.filter(function(tweet) {
                    return !(tweet.pinned || tweet.wallPriority);
                }));
            });
        });

        describe("Right", function() {
            beforeEach(getPretestSetup("right"));

            it("only displays tweets that are prioritised and not pinned", function() {
                expect(filteredTweets).toEqual(displayableTweets.filter(function(tweet) {
                    return !tweet.pinned && tweet.wallPriority;
                }));
            });
        });
    });

});
