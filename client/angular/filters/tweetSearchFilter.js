(function() {
    angular.module("TwitterWallApp").filter("tweetSearchFilter", function() {
        return function(inputTweetArray, searchText) {
            if (!searchText) {
                return inputTweetArray;
            }

            var outputArray = [];

            if (inputTweetArray) {
                //all upper case for case insensitive comparisons
                var searchTextUpperCase = searchText.toUpperCase();
                inputTweetArray.forEach(function(tweet) {
                    if (tweet.displayText.toString().toUpperCase().includes(searchTextUpperCase) ||
                        tweet.user.screen_name.toUpperCase().includes(searchTextUpperCase) ||
                        tweet.user.name.toUpperCase().includes(searchTextUpperCase)) {
                        outputArray.push(tweet);
                    }
                });
            }

            return outputArray;
        };
    });
})();
