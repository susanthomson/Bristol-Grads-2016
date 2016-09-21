(function () {
    angular.module("TwitterWallApp").controller("MainController", MainController);

    MainController.$inject = ["$scope", "twitterWallDataService", "$sce", "tweetTextManipulationService"];

    function MainController($scope, twitterWallDataService, $sce, tweetTextManipulationService) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function (tweets) {
            $scope.tweets = tweets;
            if ($scope.tweets.length > 0) {
                $scope.tweets.forEach(function (tweet) {
                    tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
                });
            }
        });

        twitterWallDataService.getMotd().then(function (motd) {
            $scope.motd = motd;
        });
    }
})();
