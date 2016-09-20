module.exports = function(client) {
    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];
    var sinceIdH = 0;
    var sinceId = 0;

    var apiResources = {
        "search/tweets": {
            since_id: 0,
            basePath: "search",
            requestsRemaining: 0,
            resetTime: 0,
        },
        "statuses/user_timeline": {
            since_id: 0,
            basePath: "statuses",
            requestsRemaining: 0,
            resetTime: 0,
        },
    };

    getTweetsFrom("bristech");
    getTweetsWithHashtag();
    var refresh = setInterval(function () {
        getTweetsFrom("bristech");
        getTweetsWithHashtag();
    } , 30000); //super conservative for now

    return {
        getTweetStore: getTweetStore,
        deleteTweet: deleteTweet,
        setTweetStore: setTweetStore
    };

    function deleteTweet(id) {
        var res = tweetStore.filter(function(tweet) {
            return tweet.id !== id;
        });
        tweetStore = res;
    }

    function getTweetStore() {
        return tweetStore;
    }

    function setTweetStore(value) {
        tweetStore = value;
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
            query.since_id = sinceId;
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

    function getApplicationRateLimits() {
        var resourceNames = Object.keys(apiResources);
        var resourcePaths = Object.values(apiResources).map(function(resource) { return resource.basePath; });
        var query = {
            resources: resourcePaths.join(","),
        };
        return new Promise(function(resolve, reject) {
            client.get("application/rate_limit_status", query, function(error, data, response) {
                if (data) {
                    resourceNames.forEach(function(name, idx) {
                        var resourceProfile = data.resources[resourcePaths[idx]][name];
                        apiResources[name].requestsRemaining = resourceProfile.remaining;
                        apiResources[name].resetTime = (resourceProfile.reset + 1) * 1000;
                    });
                    resolve();
                } else {
                    console.log(error);
                    reject(error);
                }
            });
        });
    }
};

