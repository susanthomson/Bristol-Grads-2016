(function () {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "adminDashDataService"];

    function DashController($scope, adminDashDataService) {
        $scope.loggedIn = false;
        $scope.ctrl = {};
        $scope.tweets = {};
        $scope.motd = "";

        $scope.deleteTweet = adminDashDataService.deleteTweet;

        adminDashDataService.authenticate().then(function () {
            $scope.loggedIn = true;
        }, function () {
            adminDashDataService.getAuthUri().then(function (uri) {
                $scope.loginUri = uri;
            });
        });

        adminDashDataService.getTweets().then(function (tweets) {
            $scope.tweets = tweets;
        });

        adminDashDataService.getMotd().then(function (motd) {
            $scope.motd = motd;
        });

        $scope.setMotd = function () {
            adminDashDataService.setMotd($scope.ctrl.motd).then(function (result) {
                $scope.ctrl.motd = "";
                adminDashDataService.getMotd().then(function (motd) {
                    $scope.motd = motd;
                });
            });
        };
    }
})();
