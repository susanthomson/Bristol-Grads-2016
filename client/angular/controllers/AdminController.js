(function () {

    angular.module("TwitterWallApp").controller("AdminController", AdminController);

    AdminController.$inject = [
        "$scope",
        "adminDashDataService",
        "$sce",
        "tweetTextManipulationService",
        "$routeParams",
        "$interval",
    ];

    function AdminController(
        $scope, adminDashDataService, $sce, tweetTextManipulationService, $routeParams, $interval
    ) {
        var vm = this;
        $scope.loggedIn = false;
        $scope.ctrl = {};
        $scope.tweets = [];
        $scope.motd = "";
        $scope.errorMessage = "";

        $scope.deleteTweet = adminDashDataService.deleteTweet;
        $scope.blockedUsers = [];

        $scope.getBlockedUsers = function() {
            adminDashDataService.blockedUsers().then(function (users) {
                $scope.blockedUsers = users;
            });
        };

        $scope.removeBlockedUser = function(user) {
            adminDashDataService.removeBlockedUser(user).then(function (result) {
                adminDashDataService.blockedUsers().then(function (users) {
                    $scope.blockedUsers = users;
                });
            });
        };

        $scope.addBlockedUser = function() {
            adminDashDataService.addBlockedUser($scope.ctrl.usr).then(function (result) {
                $scope.ctrl.usr = "";
                adminDashDataService.blockedUsers().then(function (users) {
                    $scope.blockedUsers = users;
                });
            });
        };

        $scope.sortByDate = tweetTextManipulationService.sortByDate;

        $scope.setMotd = function () {
            adminDashDataService.setMotd($scope.ctrl.motd).then(function (result) {
                $scope.ctrl.motd = "";
                adminDashDataService.getMotd().then(function (motd) {
                    $scope.motd = motd;
                });
            });
        };

        activate();

        function activate() {
            adminDashDataService.authenticate().then(function () {
                $scope.loggedIn = true;
            }, function () {
                adminDashDataService.getAuthUri().then(function (uri) {
                    if ($routeParams.status === "unauthorised") {
                        $scope.errorMessage = "This account is not authorised, please log in with an authorised account";
                    }
                    $scope.loginUri = uri;
                });
            });

            pageUpdate();
            $interval(pageUpdate, 5000);
        }

        function pageUpdate() {
            updateTweets();
            adminDashDataService.getMotd().then(function (motd) {
                $scope.motd = motd;
            });
        }

        function updateTweets() {
            adminDashDataService.getTweets(vm.latestUpdateTime).then(function (results) {
                if (results.tweets.length > 0) {
                    results.tweets.forEach(function (tweet) {
                        tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
                    });
                }
                $scope.tweets = $scope.tweets.concat(results.tweets);
                if (results.updates.length > 0) {
                    vm.latestUpdateTime = results.updates[results.updates.length - 1].since;
                    $scope.tweets = $scope.setDeletedFlagForDeletedTweets($scope.tweets, results.updates);
                }
            });
        }

        $scope.setDeletedFlagForDeletedTweets = function(tweets, updates) {
            updates.forEach(function(del) {
                if (del.type === "tweet_status" && del.status.deleted) {
                    tweets.forEach(function(tweet) {
                        if (tweet.id_str === del.id) {
                            tweet.deleted = true;
                        }
                    });
                }
            });
            return tweets;
        };
    }
})();
