(function() {
    angular.module("TwitterWallApp").controller("MainController", MainController);

    MainController.$inject = ["$scope", "twitterWallDataService"];

    function MainController($scope, twitterWallDataService) {
        $scope.tweets = [];

        twitterWallDataService.getTweets().then(function(tweets) {
            $scope.tweets = tweets;
            $scope.tweets.forEach(function(tweet) {
            	tweet.entities.hashtags.forEach(function(hashtag){
					tweet.text = tweet.text.split("#" + hashtag.text).join("<a href=''><b>#" + hashtag + "</b></a>");
            	});
            	tweet.entities.user_mentions.forEach(function(mention){
					tweet.text = tweet.text.split("@" + mention.text).join("<a href=''><b>@" + mention + "</b></a>");
            	});
        	});
        });

        twitterWallDataService.getMotd().then(function(motd) {
            $scope.motd = motd;
        });
    }
})();

