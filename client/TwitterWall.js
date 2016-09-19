(function() {

    var app = angular.module("TwitterWall", [])
    .controller("DashController", ["$scope", "$http",
    function($scope, $http) {
        $scope.loggedIn = false;

        $http.get("/admin").then(function() {
            $scope.loggedIn = true;
        }, function() {
            $http.get("/api/oauth/uri").then(function(result) {
                $scope.loginUri = result.data.uri;
            });
        });

    }]);

})();
