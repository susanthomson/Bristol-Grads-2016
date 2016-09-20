(function() {
    angular.module("TwitterWallApp", ['ngSanitize']).controller("MainController",  MainController);

    MainController.$inject = ["$scope", "twitterWallDataService", "$sce"];

    function MainController($scope, twitterWallDataService, $sce) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
            $scope.tweets.forEach(function(tweet) {
            	if (tweet.entities.hashtags !== undefined) {
                	tweet.text = $sce.trustAsHtml(addHashtag(tweet.text, tweet.entities.hashtags));
            	}
            	if (tweet.entities.mentions !== undefined) {
                	tweet.text = $sce.trustAsHtml(addMention(tweet.text, tweet.entities.user_mentions));
            	}
            });
        });

        function addHashtag(str, hashtags) {
        	hashtags.forEach(function(hashtag) {
            	var substr = hashtag.text;
                str = str.split("#" + substr).join(" <b>#" + substr + "</b> ");
            });
            return str;
        }

        function addMention(str, mentions) {
        	mentions.forEach(function(mention) {
                	var substr = mention.text;
                    str = str.split("@" + substr).join(" <b>@" + substr + "</b> ");
           });
            return str;
        }

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();

