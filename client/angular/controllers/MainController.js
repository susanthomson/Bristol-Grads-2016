(function() {
    angular.module("TwitterWallApp").controller("MainController",  MainController);

    MainController.$inject = ["$scope", "twitterWallDataService", "$sce"];

    function MainController($scope, twitterWallDataService, $sce) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
            if ($scope.tweets.length > 0) {
                $scope.tweets.forEach(function(tweet) {
                    tweet.text = $sce.trustAsHtml(updateTweet(tweet));
                });
            }
        });

        function updateTweet(tweet) {
            tweet.text = $scope.addHashtag(tweet.text, tweet.entities.hashtags);
            tweet.text = $scope.addMention(tweet.text, tweet.entities.user_mentions);
            tweet.text = $scope.addUrl(tweet.text, tweet.entities.urls);
            if (tweet.entities.media) {
                tweet.text = $scope.deleteMediaLink(tweet.text, tweet.entities.media);
            }
            return tweet.text;
        }

        $scope.addHashtag = function(str, hashtags) {
            hashtags.forEach(function(hashtag) {
                var substr = hashtag.text;
                str = str.split("#" + substr).join(" <b>#" + substr + "</b> ");
            });
            return str;
        };

        $scope.addMention = function(str, mentions) {
            mentions.forEach(function(mention) {
                    var substr = mention.screen_name;
                    str = str.split("@" + substr).join(" <b>@" + substr + "</b> ");
                });
            return str;
        };

        $scope.addUrl = function(str, urls) {
            urls.forEach(function(uri) {
                    var substr = uri.url;
                    str = str.split(substr).join(" <b>" + uri.display_url + "</b> ");
                });
            return str;
        };

        $scope.deleteMediaLink = function(str, media) {
            media.forEach(function(m) {
                str = str.split(m.url).join("");
            });
            return str;
        };

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();

