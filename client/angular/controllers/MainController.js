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
            updateTweets();
            $interval(updateTweets, 5000);

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
                }
            });
        }
    }
})();
