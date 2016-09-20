(function() {
    angular.module("TwitterWallApp", ['ngSanitize']).controller("MainController",  MainController);

    MainController.$inject = ["$scope", "twitterWallDataService", "$sce"];

    function MainController($scope, twitterWallDataService, $sce) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
            $scope.tweets.forEach(function(tweet) {
            	if (tweet.entities.hashtags !== undefined) {
                	tweet.text = addHashtag(tweet.text, tweet.entities.hashtags);
            	}
            	if (tweet.entities.user_mentions != undefined && tweet.entities.user_mentions.length > 0) {
                	tweet.text = addMention(tweet.text, tweet.entities.user_mentions);
            	}
            	tweet.text = $sce.trustAsHtml(tweet.text);
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
                	var substr = mention.screen_name;
                    str = str.split("@" + substr).join(" <b>@" + substr + "</b> ");
           });
            return str;
        }

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();

