angular.module("TwitterWallApp").controller("MainController", function($scope, $http) {
    $scope.tweets = [];

    $http.get("api/test").then(function(response) {
    	$scope.tweets = response.data;
    });
});


