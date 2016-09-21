describe("tweetTextManipulationService", function () {
    var tweetTextManipulationService;

    beforeEach(function () {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function (_tweetTextManipulationService_) {
        tweetTextManipulationService = _tweetTextManipulationService_;
    }));

    describe("On string manipulation", function () {
        it("adds special html tag for displaying hashtags inside tweets", function () {
            expect(tweetTextManipulationService.addHashtag("#hello world", [{
                text: "hello"
            }])).toEqual(" <b>#hello</b>  world");
        });
        it("adds special html tag for displaying mentions inside tweets", function () {
            expect(tweetTextManipulationService.addMention("@hello world", [{
                screen_name: "hello"
            }])).toEqual(" <b>@hello</b>  world");
        });
        it("adds special html tag for displaying urls inside tweets", function () {
            expect(tweetTextManipulationService.addUrl("www.hello world", [{
                url: "www.hello",
                display_url: "hell"
            }])).toEqual(" <b>hell</b>  world");
        });
        it("delete media urls inside tweets", function () {
            expect(tweetTextManipulationService.deleteMediaLink("www.hello world", [{
                url: "www.hello"
            }])).toEqual(" world");
        });
    });
});
