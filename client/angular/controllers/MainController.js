(function () {
    angular.module("TwitterWallApp").controller("MainController", MainController);

    MainController.$inject = [
        "$scope",
        "twitterWallDataService",
        "$sce",
        "tweetTextManipulationService",
        "$interval",
    ];

    function MainController($scope, twitterWallDataService, $sce, tweetTextManipulationService, $interval) {
        var vm = this;

        $scope.sortByDate = tweetTextManipulationService.sortByDate;

        $scope.tweets = [];

        activate();

        function activate() {
            pageUpdate();
            $interval(pageUpdate, 5000);
        }

        function pageUpdate() {
            updateTweets();
            twitterWallDataService.getMotd().then(function (motd) {
                $scope.motd = motd;
            });
        }

        function updateTweets() {
            twitterWallDataService.getTweets(vm.latestUpdateTime).then(function (results) {
                if (results.tweets.length > 0) {
                    results.tweets.forEach(function (tweet) {
                        tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
                    });
                }
                $scope.tweets = $scope.tweets.concat(results.tweets);
                if (results.updates.length > 0) {
                    vm.latestUpdateTime = results.updates[results.updates.length - 1].since;
                    var deletedTweets = {};
                    results.updates.forEach(function (update) {
                        if (update.type === "tweet_status" && update.status.deleted) {
                            deletedTweets[update.id] = update.status.deleted;
                        }
                        if (update.type === "user_block") {
                            $scope.tweets = $scope.tweets.filter(function(tweet) {
                                return tweet.user.screen_name !== update.screen_name;
                            });
                        }
                    });
                    $scope.tweets = $scope.tweets.filter(function (tweet) {
                        return deletedTweets[tweet.id_str] !== true;
                    });
                    $scope.tweets = $scope.setPinnedFlagForPinnedTweets($scope.tweets, results.updates);
                }
            });
        }

        $scope.setPinnedFlagForPinnedTweets = function (tweets, updates) {
            console.log("setting pins in main");
            updates.forEach(function (update) {
                if (update.type === "tweet_status" && update.status.pinned) {
                    tweets.forEach(function (tweet) {
                        if (tweet.id_str === update.id) {
                            tweet.pinned = true;
                        }
                    });
                }
            });
            return tweets;
        };
    }
})();
