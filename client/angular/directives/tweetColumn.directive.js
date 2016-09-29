(function() {
    angular.module("TwitterWallApp").directive("tweetColumn", tweetColumn);

    function tweetColumn() {
        return {
            restrict: "E",
            scope: {
                tweets: "=",
                admin: "=",
                position: "@",
                deleteTweet: "&",
                addBlockedUser: "&",
                setPinnedStatus: "&",
            },
            templateUrl: function(element, attrs) {
                return "templates/tweet-column-" + attrs.position + ".html";
            },
            link: function(scope, element, attrs) {
                scope.getTweets = function() {
                    return scope.admin ? scope.tweets : scope.tweets.filter(function(tweet) {
                        return !(tweet.deleted || tweet.blocked);
                    });
                };
            },
        };
    }
})();
