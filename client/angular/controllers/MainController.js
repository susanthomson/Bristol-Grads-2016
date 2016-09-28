(function() {
    angular.module("TwitterWallApp").controller("MainController", MainController);

    MainController.$inject = [
        "$scope",
        "twitterWallDataService",
        "$sce",
        "tweetTextManipulationService",
        "$interval",
    ];

    function MainController($scope, twitterWallDataService, $sce, tweetTextManipulationService, $interval) {
        var vm = this;

        $scope.sortByDate = tweetTextManipulationService.sortByDate;

        $scope.tweets = [];
        $scope.speakers = [];

        activate();

        function activate() {
            pageUpdate();
            $interval(pageUpdate, 5000);
        }

        function pageUpdate() {
            updateTweets();
            twitterWallDataService.getMotd().then(function(motd) {
                $scope.motd = motd;
            });
            twitterWallDataService.getSpeakers().then(function(speakers) {
                $scope.speakers = speakers;
            }).catch(function(err) {
                console.log("Could not get list of speakers:" + err);
            });
        }

        function updateTweets() {
            twitterWallDataService.getTweets(vm.latestUpdateTime).then(function(results) {
                if (results.tweets.length > 0) {
                    results.tweets.forEach(function(tweet) {
                        $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
                        if ($scope.speakers.indexOf(tweet.user.screen_name) !== -1) {
                            tweet.wallPriority = true;
                        }
                    });
                }
                $scope.tweets = $scope.tweets.concat(results.tweets);
                if (results.updates.length > 0) {
                    vm.latestUpdateTime = results.updates[results.updates.length - 1].since;
                    var deletedTweets = {};
                    results.updates.forEach(function(update) {
                        if (update.type === "tweet_status" && update.status.deleted) {
                            deletedTweets[update.id] = update.status.deleted;
                        }
                        if (update.type === "user_block") {
                            $scope.tweets = $scope.tweets.filter(function(tweet) {
                                return tweet.user.screen_name !== update.screen_name;
                            });
                        }
                        if (update.type === "speaker_update") {
                            if (update.operation === "add") {
                                $scope.tweets = $scope.tweets.map(function(tweet) {
                                    if (tweet.user.screen_name === update.screen_name) {
                                        tweet.wallPriority = true;
                                    }
                                    return tweet;
                                });
                            } else if (update.operation === "remove") {
                                $scope.tweets = $scope.tweets.map(function(tweet) {
                                    if (tweet.user.screen_name === update.screen_name) {
                                        tweet.wallPriority = false;
                                    }
                                    return tweet;
                                });
                            }
                        }
                    });
                    $scope.tweets = $scope.tweets.filter(function(tweet) {
                        return deletedTweets[tweet.id_str] !== true;
                    });
                    $scope.tweets = $scope.setFlagsForTweets($scope.tweets, results.updates);
                }
            });
        }

        $scope.setFlagsForTweets = function(tweets, updates) {
            updates.forEach(function(update) {
                if (update.type === "tweet_status") {
                    tweets.forEach(function(tweet) {
                        if (tweet.id_str === update.id) {
                            if (update.status.deleted !== undefined) {
                                tweet.deleted = update.status.deleted;
                            }
                            if (update.status.pinned !== undefined) {
                                tweet.pinned = update.status.pinned;
                            }
                        }
                    });
                }
            });
            return tweets;
        };
    }
})();
