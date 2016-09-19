(function() {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "adminDashDataService"];

    function DashController($scope, adminDashDataService) {
        $scope.loggedIn = false;
        $scope.ctrl = {};

        adminDashDataService.authenticate().then(function() {
            $scope.loggedIn = true;
        }, function() {
            adminDashDataService.getAuthUri().then(function(uri) {
                $scope.loginUri = uri;
            });
        });

        $scope.setMotd = function () {
            adminDashDataService.setMotd($scope.ctrl.motd)
            .then(function (result) {
                $scope.ctrl.motd = "";
            });
        };

    }

})();

