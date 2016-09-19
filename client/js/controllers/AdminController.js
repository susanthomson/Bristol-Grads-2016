(function() {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "twitterWallAdminDataService"];

    function DashController($scope, twitterWallAdminDataService) {
        $scope.loggedIn = false;
        $scope.ctrl = {};

        twitterWallAdminDataService.authenticate().then(function() {
            $scope.loggedIn = true;
        }, function() {
            twitterWallAdminDataService.getAuthUri().then(function(uri) {
                $scope.loginUri = uri;
            });
        });

        $scope.setMotd = function () {
            twitterWallAdminDataService($scope.ctrl.motd)
            .then(function (result) {
                $scope.ctrl.motd = "";
            });
        };

    }

})();

