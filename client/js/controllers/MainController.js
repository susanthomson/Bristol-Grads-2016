(function() {
    angular.module("TwitterWallApp", ['ngSanitize']).controller("MainController",  MainController);

    MainController.$inject = ["$scope", "twitterWallDataService", "$sce"];

    function MainController($scope, twitterWallDataService, $sce) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
            $scope.tweets.forEach(function(tweet) {
                tweet.text = addHashtag(tweet.text, tweet.entities.hashtags);
                tweet.text = addMention(tweet.text, tweet.entities.user_mentions);
                tweet.text = addUrl(tweet.text, tweet.entities.urls);
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

        function addUrl(str, urls) {console.log(urls.length);
        	urls.forEach(function(uri) {
                	var substr = uri.url;
                	
                    str = str.split(substr).join("  <b>" + uri.display_url + "</b>  ");
           });
            return str;
        }

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();

