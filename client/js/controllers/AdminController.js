(function() {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "$http", "twitterWallAdminDataService"];

    function DashController($scope, $http, twitterWallAdminDataService) {
        $scope.loggedIn = false;
        $scope.ctrl = {};

        twitterWallAdminDataService.authenticate().then(function() {
            $scope.loggedIn = true;
        }, function() {
            $http.get("/api/oauth/uri").then(function(result) {
                $scope.loginUri = result.data.uri;
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

