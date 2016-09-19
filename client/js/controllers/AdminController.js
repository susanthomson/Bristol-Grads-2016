(function() {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "$http"];

    function DashController($scope, $http) {
        $scope.loggedIn = false;
        $scope.ctrl = {};

        $http.get("/admin").then(function() {
            $scope.loggedIn = true;
        }, function() {
            $http.get("/api/oauth/uri").then(function(result) {
                $scope.loginUri = result.data.uri;
            });
        });

        $scope.setMotd = function () {
            var body = {motd: $scope.ctrl.motd};
            $http.post("/admin/motd", body, {
                headers: {"Content-type": "application/json"}
            })
            .then(function (result) {
                $scope.ctrl.motd = "";
            });
        };

    }

})();

