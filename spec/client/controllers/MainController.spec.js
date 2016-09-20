describe("MainController", function () {

    var $testScope;
    var $q;

    var deferredTweets;
    var deferredMotd;

    var MainController;
    var twitterWallDataService;

    //TODO : make this look more like the objects return from the twitter API
    var testTweets = [
        {
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
        },
        {
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
        }
    ];

    beforeEach(function() {
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    var testMotd = "Test message of the day";

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, twitterWallDataService) {
        $testScope = _$rootScope_.$new();

        $q = _$q_;
        deferredTweets = _$q_.defer();
        deferredMotd = _$q_.defer();

        spyOn(twitterWallDataService, "getTweets").and.returnValue(deferredTweets.promise);
        spyOn(twitterWallDataService, "getMotd").and.returnValue(deferredMotd.promise);

        MainController = _$controller_("MainController", {
            $scope: $testScope,
            twitterWallDataService: twitterWallDataService
        });
    }));

    describe("On startup", function () {
        it("Gets an initial list of tweets from data service", function () {
            deferredTweets.resolve(testTweets);
            $testScope.$apply();
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("Gets message of the day from data service", function () {
            deferredMotd.resolve(testMotd);
            $testScope.$apply();
            expect($testScope.motd).toEqual(testMotd);
        });
    });
});
