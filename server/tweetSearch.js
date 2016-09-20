module.exports = function(client) {
    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];
    var sinceIdH = 0;
    var sinceId = 0;

    getTweetsFrom("bristech");
    getTweetsWithHashtag();
    var refresh = setInterval(function () {
        getTweetsFrom("bristech");
        getTweetsWithHashtag();
    } , 30000); //super conservative for now

    return {
        getTweetStore: getTweetStore,
    };

    function getTweetStore() {
        return tweetStore;
    }

    function getTweetsWithHashtag() {
        var query = {
            q: hashtags.join(" OR "),
        };
        if (sinceIdH > 0) {
            query.since_id = sinceIdH;
        }
        client.get("search/tweets", query, function(error, tweets, response) {
            if (tweets) {
                tweets.statuses.forEach(function(tweet) {
                    sinceIdH = tweet.id > sinceIdH ? tweet.id : sinceIdH;
                    tweetStore.push(tweet);
                });
            } else {
                console.log(error);
            }
        });
    }

    function getTweetsFrom(screenName) {
        var query = {screen_name: screenName};
        if (sinceId > 0) {
            query.sinceId = sinceId;
        }
        client.get("statuses/user_timeline", query, function(error, tweets, response) {
            if (tweets) {
                tweets.forEach(function(tweet) {
                    sinceId = tweet.id > sinceId ? tweet.id : sinceId;
                    tweetStore.push(tweet);
                });
            } else {
                console.log(error);
            }
        });
    }
};

