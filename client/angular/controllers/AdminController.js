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
        $scope.speakers = [];
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

        $scope.addBlockedUser = function(name, screen_name) {
            adminDashDataService.addBlockedUser(name, screen_name).then(function (result) {
                adminDashDataService.blockedUsers().then(function (users) {
                    $scope.blockedUsers = users;
                });
            });
        };

        $scope.pinTweet = adminDashDataService.pinTweet;

        $scope.sortByDate = tweetTextManipulationService.sortByDate;
        $scope.addSpeaker = addSpeaker;
        $scope.removeSpeaker = removeSpeaker;

        $scope.setMotd = function () {
            adminDashDataService.setMotd($scope.ctrl.motd).then(function (result) {
                $scope.ctrl.motd = "";
                return adminDashDataService.getMotd();
            }).then(function (motd) {
                $scope.motd = motd;
            });
        };

        $scope.logOut = function () {
            adminDashDataService.logOut().then(function () {
                adminDashDataService.getAuthUri().then(function (uri) {
                    $scope.loginUri = uri;
                    $scope.loggedIn = false;
                });
            });
        };

        activate();

        function activate() {
            adminDashDataService.authenticate().then(function () {
                $scope.loggedIn = true;
                pageUpdate();
                $interval(pageUpdate, 5000);
            }).catch(function () {
                adminDashDataService.getAuthUri().then(function (uri) {
                    if ($routeParams.status === "unauthorised") {
                        $scope.errorMessage = "This account is not authorised, please log in with an authorised account";
                    }
                    $scope.loginUri = uri;
                });
            });
        }

        function pageUpdate() {
            updateTweets();
            adminDashDataService.getMotd().then(function (motd) {
                $scope.motd = motd;
            });
            adminDashDataService.getSpeakers().then(function (speakers) {
                $scope.speakers = speakers;
            });
        }

        function updateTweets() {
            adminDashDataService.getTweets(vm.latestUpdateTime).then(function (results) {
                if (results.updates.length > 0) {
                    if (results.tweets.length > 0) {
                        results.tweets.forEach(function (tweet) {
                            tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
                        });
                    }
                    $scope.tweets = $scope.tweets.concat(results.tweets);
                    vm.latestUpdateTime = results.updates[results.updates.length - 1].since;
                    $scope.tweets = $scope.setDeletedFlagForDeletedTweets($scope.tweets, results.updates);
                    $scope.tweets = $scope.setBlockedFlagForBlockedTweets($scope.tweets, results.updates);
                    $scope.tweets = $scope.setPinnedFlagForPinnedTweets($scope.tweets, results.updates);
                }
            });
        }

        $scope.setBlockedFlagForBlockedTweets = function(tweets, updates) {
            updates.forEach(function(del) {
                if (del.type === "user_block") {
                    tweets.forEach(function(tweet) {
                        if (tweet.user.screen_name === del.screen_name) {
                            tweet.blocked = true;
                        }
                    });
                }
            });
            return tweets;
        };

        function addSpeaker() {
            adminDashDataService.addSpeaker($scope.ctrl.speaker).then(function (result) {
                $scope.ctrl.speaker = "";
                return adminDashDataService.getSpeakers();
            }).then(function (speakers) {
                $scope.speakers = speakers;
            });
        }

        function removeSpeaker(speaker) {
            adminDashDataService.removeSpeaker(speaker).then(function (result) {
                return adminDashDataService.getSpeakers();
            }).then(function (speakers) {
                $scope.speakers = speakers;
            });
        }


        $scope.setDeletedFlagForDeletedTweets = function (tweets, updates) {
            updates.forEach(function (del) {
                if (del.type === "tweet_status" && del.status.deleted) {
                    tweets.forEach(function (tweet) {
                        if (tweet.id_str === del.id) {
                            tweet.deleted = true;
                        }
                    });
                }
            });
            return tweets;
        };

        $scope.setPinnedFlagForPinnedTweets = function (tweets, updates) {
            updates.forEach(function (update) {
                if (update.type === "tweet_status" && update.status.pinned) {
                    tweets.forEach(function (tweet) {
                        if (tweet.id_str === update.id) {
                            tweet.pinned = true;
                        }
                    });
                }
            });
            return tweets;
        };
    }
})();
