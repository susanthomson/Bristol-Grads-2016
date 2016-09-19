(function() {

    angular.module("TwitterWallAdminApp")
        .controller("DashController", DashController);

    DashController.$inject = ["$scope", "$http"];

    function DashController($scope, $http) {
        $scope.loggedIn = false;

        $http.get("/admin").then(function() {
            $scope.loggedIn = true;
        }, function() {
            $http.get("/api/oauth/uri").then(function(result) {
                $scope.loginUri = result.data.uri;
            });
        });

    }

})();

