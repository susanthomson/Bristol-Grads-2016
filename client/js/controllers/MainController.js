(function() {
    angular.module("TwitterWallApp").controller("MainController", MainController);

    MainController.$inject = ["$scope", "twitterWallDataService"];

    function MainController($scope, twitterWallDataService) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
        });

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();