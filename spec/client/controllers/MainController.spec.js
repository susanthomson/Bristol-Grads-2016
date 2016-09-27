describe("MainController", function () {

    var $testScope;
    var $q;

    var deferredTweets;
    var deferredMotd;

    var MainController;
    var twitterWallDataService;
    var tweetTextManipulationService;

    var testTweets = [
        {
            text: "Test tweet 1 #hello @bristech",
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
            text: "Test tweet 2 www.google.com",
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

    var testTweetData = {
        tweets: testTweets,
        updates: [],
    };

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    var testMotd = "Test message of the day";

    beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _twitterWallDataService_, _tweetTextManipulationService_) {
        $testScope = _$rootScope_.$new();
        twitterWallDataService = _twitterWallDataService_;
        tweetTextManipulationService = _tweetTextManipulationService_;
        $q = _$q_;
        deferredTweets = _$q_.defer();
        deferredMotd = _$q_.defer();

        spyOn(twitterWallDataService, "getTweets").and.returnValue(deferredTweets.promise);
        spyOn(twitterWallDataService, "getMotd").and.returnValue(deferredMotd.promise);

        MainController = _$controller_("MainController", {
            $scope: $testScope,
            twitterWallDataService: twitterWallDataService,
            tweetTextManipulationService : tweetTextManipulationService
        });
    }));

    describe("On startup", function () {
        it("Gets an initial list of tweets from data service", function () {
            deferredTweets.resolve(testTweetData);
            $testScope.$apply();
            expect($testScope.tweets).toEqual(testTweets);
        });
        it("Gets message of the day from data service", function () {
            deferredMotd.resolve(testMotd);
            $testScope.$apply();
            expect($testScope.motd).toEqual(testMotd);
        });
    });
    describe("On string manipulation", function () {
        it("adds special html tag for displaying hashtags inside tweets", function() {
            expect(tweetTextManipulationService.addHashtag("#hello world", [{text: "hello"}])).toEqual("<b>#hello</b> world");
        });
        it("adds special html tag for displaying mentions inside tweets", function() {
            expect(tweetTextManipulationService.addMention("@hello world", [{screen_name: "hello"}])).toEqual("<b>@hello</b> world");
        });
        it("adds special html tag for displaying urls inside tweets", function() {
            expect(tweetTextManipulationService.addUrl("www.hello world", [{url: "www.hello", display_url: "hell"}])).toEqual("<b>hell</b> world");
        });
        it("delete media urls inside tweets", function() {
            expect(tweetTextManipulationService.deleteMediaLink("www.hello world", [{url: "www.hello"}])).toEqual(" world");
        });
    });
});
