module.exports = function(client) {
    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];
    var sinceIdH;
    var sinceId;

    getTweetsFrom("bristech");
    getTweetsWithHashtag();
    var refresh = setInterval(function () {
        getTweetsFrom("bristech");
        getTweetsWithHashtag();
    } , 30000); //super conservative for now

    return {
        getTweetStore: getTweetStore,
        deleteTweet: deleteTweet,
        tweetStore: tweetStore
    };

    function deleteTweet(id) {
        tweetStore = tweetStore.filter(function(tweet) {
            return tweet.id_str !== id;
        });
    }

    function getTweetStore() {
        return tweetStore;
    }

    function getTweetsWithHashtag() {
        var query = {
            q: hashtags.join(" OR "),
            since_id: sinceIdH,
        };
        client.get("search/tweets", query, function(error, tweets, response) {
            if (tweets) {
                tweets.statuses.forEach(function(tweet) {
                    sinceIdH = tweet.id;
                    tweetStore.push(tweet);
                });
            } else {
                console.log(error);
            }
        });
    }

    function getTweetsFrom(screenName) {
        var query = {screen_name: screenName};
        if (sinceId) {
            query.sinceId = sinceId;
        }
        client.get("statuses/user_timeline", query, function(error, tweets, response) {
            if (tweets) {
                tweets.forEach(function(tweet) {
                    sinceId = tweet.id;
                    tweetStore.push(tweet);
                });
            } else {
                console.log(error);
            }
        });
    }
};

