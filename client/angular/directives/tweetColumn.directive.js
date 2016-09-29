(function() {
    angular.module("TwitterWallApp").directive("tweetColumn", tweetColumn);

    function tweetColumn() {
        return {
            restrict: "E",
            scope: {
                tweets: "=",
                admin: "=",
                position: "@",
                setDeletedStatus: "&",
                addBlockedUser: "&",
                setPinnedStatus: "&",
            },
            templateUrl: function(element, attrs) {
                return "templates/tweet-column-" + attrs.position + ".html";
            },
            link: function(scope, element, attrs) {
                scope.getTweets = function() {
                    return (scope.admin ? scope.tweets : scope.tweets.filter(function(tweet) {
                        return !(tweet.deleted || tweet.blocked);
                    })).filter(function(tweet) {
                        return getTweetColumn(tweet) === scope.position;
                    });
                };

                function getTweetColumn(tweet) {
                    if (tweet.pinned) {
                        return "left";
                    } else if (tweet.wallPriority) {
                        return "right";
                    } else {
                        return "middle";
                    }
                }
            },
        };
    }
})();
