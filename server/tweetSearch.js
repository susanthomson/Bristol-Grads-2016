module.exports = function(client) {
    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];

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

    var searchUpdater;
    var userUpdater;

    var searchUpdate = function() {
        if (apiResources["search/tweets"].requestsRemaining > 0) {
            getTweetsWithHashtag();
            searchUpdater = setTimeout(searchUpdate, 5000);
        } else {
            searchUpdater = setTimeout(searchUpdate, apiResources["search/tweets"].resetTime - new Date().getTime());
        }
    };
    var userUpdate = function() {
        if (apiResources["statuses/user_timeline"].requestsRemaining > 0) {
            getTweetsFrom("bristech");
            userUpdater = setTimeout(userUpdate, 5000);
        } else {
            userUpdater = setTimeout(userUpdate, apiResources["statuses/user_timeline"].resetTime - new Date().getTime());
        }
    };

    getApplicationRateLimits(function() {
        searchUpdate();
        userUpdate();
    });

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
        var last_id = apiResources["search/tweets"].since_id;
        if (last_id > 0) {
            query.since_id = last_id;
        }
        client.get("search/tweets", query, function(error, tweets, response) {
            if (tweets) {
                apiResources["search/tweets"].since_id = tweets.statuses.reduce(function(since, currTweet) {
                    return since > currTweet.id ? since : currTweet.id;
                }, apiResources["search/tweets"].since_id);
                tweetStore = tweetStore.concat(tweets.statuses.sort(function(statusA, statusB) {
                    return statusA.id - statusB.id;
                }));
                apiResources["search/tweets"].requestsRemaining = response.headers["x-rate-limit-remaining"];
                apiResources["search/tweets"].resetTime = response.headers["x-rate-limit-reset"];
            } else {
                console.log(error);
            }
        });
    }

    function getTweetsFrom(screenName) {
        var query = {screen_name: screenName};
        var last_id = apiResources["statuses/user_timeline"].since_id;
        if (last_id > 0) {
            query.since_id = last_id;
        }
        client.get("statuses/user_timeline", query, function(error, tweets, response) {
            if (tweets) {
                apiResources["statuses/user_timeline"].since_id = tweets.reduce(function(since, currTweet) {
                    return since > currTweet.id ? since : currTweet.id;
                }, apiResources["statuses/user_timeline"].since_id);
                tweetStore = tweetStore.concat(tweets.sort(function(statusA, statusB) {
                    return statusA.id - statusB.id;
                }));
                apiResources["statuses/user_timeline"].requestsRemaining = response.headers["x-rate-limit-remaining"];
                apiResources["statuses/user_timeline"].resetTime = response.headers["x-rate-limit-reset"];
            } else {
                console.log(error);
            }
        });
    }

    function getApplicationRateLimits(callback) {
        var resourceNames = Object.keys(apiResources);
        var resourcePaths = resourceNames.map(function(resourceName) { return apiResources[resourceName].basePath; });
        var query = {
            resources: resourcePaths.join(","),
        };
        client.get("application/rate_limit_status", query, function(error, data, response) {
            if (data) {
                resourceNames.forEach(function(name, idx) {
                    var resourceProfile = data.resources[resourcePaths[idx]][name];
                    apiResources[name].requestsRemaining = resourceProfile.remaining;
                    apiResources[name].resetTime = (resourceProfile.reset + 1) * 1000;
                });
            } else {
                console.log(error);
            }
            callback();
        });
    }
};

