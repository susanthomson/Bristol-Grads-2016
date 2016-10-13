(function() {
    angular.module("TwitterWallApp").filter("tweetSearchFilter", function() {
    	return function(inputTweetArray, searchText) {
    		if(!searchText) {
    			return inputTweetArray;
    		}

    		var outputArray = [];

    		if(inputTweetArray) {
    			//all upper case for case insensitive comparisons
    			var seachTextUpperCase = searchText.toUpperCase();
	    		inputTweetArray.forEach(function(tweet) {
	    			if (tweet.displayText.toString().toUpperCase().includes(seachTextUpperCase) || 
	    				tweet.user.screen_name.toUpperCase().includes(seachTextUpperCase) ||
	    				tweet.user.name.toUpperCase().includes(seachTextUpperCase)) {
	    				outputArray.push(tweet)
	    			}
	    		});
    		}

    		return outputArray;
    	};
    });
})();
