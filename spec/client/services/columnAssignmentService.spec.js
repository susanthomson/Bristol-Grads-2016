describe("columnAssignmentService", function() {

    var columnAssignmentService;

    beforeEach(function() {
        angular.module("ngMaterial", []);
        angular.module("angularMoment", []);
        angular.module("ngSanitize", []);
        module("TwitterWallApp");
    });

    beforeEach(inject(function(_columnAssignmentService_) {
        columnAssignmentService = _columnAssignmentService_;
    }));

    var testColumnDataList;
    var testTweets;

    beforeEach(function() {
        var x = new(columnAssignmentService.ColumnData)(2, function(tweet) {
            return tweet.pinned === true;
        }, function(tweetA, tweetB) {
            return tweetA.pinTime - tweetB.pinTime;
        });
        testColumnDataList = [
            new columnAssignmentService.ColumnData(2, function(tweet) {
                return tweet.pinned === true;
            }, function(tweetA, tweetB) {
                return tweetA.pinTime - tweetB.pinTime;
            }),
            new columnAssignmentService.ColumnData(3, function(tweet) {
                return tweet.wallPriority === true;
            }, function(tweetA, tweetB) {
                return tweetA.time - tweetB.time;
            }),
            new columnAssignmentService.ColumnData(3, function(tweet) {
                return true;
            }, function(tweetA, tweetB) {
                return tweetA.time - tweetB.time;
            }),
        ];

        testTweets = [{
            pinned: true,
            time: new Date(5),
            pinnedTime: new Date(37)
        }, {
            wallPriority: true,
            time: new Date(10)
        }, {
            pinned: false,
            time: new Date(12)
        }, {
            time: new Date(16)
        }, {
            pinned: true,
            time: new Date(20),
            pinnedTime: new Date(29)
        }, {
            wallPriority: true,
            time: new Date(25)
        }, {
            pinned: false,
            time: new Date(31),
            pinnedTime: new Date(44)
        }, {
            time: new Date(52)
        }];
    });

    describe("assignColumns", function() {
        it("returns an array of arrays with length equal to the length of the input column data list", function() {
            var columnList = columnAssignmentService.assignColumns(testTweets, testColumnDataList);
            expect(columnList).toEqual([jasmine.any(Array), jasmine.any(Array), jasmine.any(Array)]);
        });
    });

});
