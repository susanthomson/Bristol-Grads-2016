angular.module("TwitterWallApp").controller("MainController", function($scope, $http) {
    $scope.tweets = [];

    $http.get("/api/tweets").then(function(response) {
        $scope.tweets = response.data;
    });

    $http.get("api/motd").then(function(response) {
        $scope.motd = response.data;
    });
});

