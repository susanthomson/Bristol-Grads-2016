module.exports = function(client) {
    var tweetStore = [];
    var tweetUpdates = [];
    var hashtags = ["#bristech", "#bristech2016"];

    // Compares two strings that represent numbers of greater size than can be handled as `number` types without loss
    // of precision, and returns true if the first is numerically greater than the second
    function idStrComp(a, b) {
        if (Number(a) === Number(b)) {
            return a > b;
        }
        return Number(a) > Number(b);
    }

    function addTweetItem(tweets, type) {
        tweetUpdates.push({
            type: type,
            startIdx: tweetStore.length,
            since: new Date(),
        });
        tweetStore = tweetStore.concat(tweets);
    }

    var apiResources = {
        "search/tweets": {
            since_id: "0",
            basePath: "search",
            requestsRemaining: 0,
            resetTime: 0,
            addData: function(tweets) {
                this.since_id = tweets.statuses.reduce(function(since, currTweet) {
                    return idStrComp(since, currTweet.id_str) ? since : currTweet.id_str;
                }, this.since_id);
                addTweetItem(tweets.statuses, "tagged");
            }
        },
        "statuses/user_timeline": {
            since_id: "0",
            basePath: "statuses",
            requestsRemaining: 0,
            resetTime: 0,
            addData: function(tweets) {
                this.since_id = tweets.reduce(function(since, currTweet) {
                    return idStrComp(since, currTweet.id_str) ? since : currTweet.id_str;
                }, this.since_id);
                addTweetItem(tweets, "official");
            }
        },
    };

    var searchUpdater;
    var userUpdater;

    function resourceUpdate(apiResource, updateFn, timer) {
        if (apiResources[apiResource].requestsRemaining > 0) {
            updateFn();
            timer = setTimeout(function() {
                resourceUpdate(apiResource, updateFn, timer);
            }, 5000);
        } else {
            timer = setTimeout(function() {
                apiResources[apiResource].requestsRemaining = 1;
                resourceUpdate(apiResource, updateFn, timer);
            }, apiResources[apiResource].resetTime - new Date().getTime());
        }
    }

    var hashtagUpdateFn = tweetResourceGetter("search/tweets", {q: hashtags.join(" OR ")});
    var timelineUpdateFn = tweetResourceGetter("statuses/user_timeline", {screen_name: "bristech"});

    getApplicationRateLimits(function() {
        resourceUpdate("search/tweets", hashtagUpdateFn, searchUpdater);
        resourceUpdate("statuses/user_timeline", timelineUpdateFn, userUpdater);
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

    function loadTweets(tweets) {
        addTweetItem(tweets, "test");
    }

    function getTweetStore() {
        return tweetStore;
    }

    function getTweetsSince(since) {
        var update = tweetUpdates.find(function(update) {
            return update.since >= since;
        });
        var tweets = tweetStore.slice(update.startIdx);
        return tweets;
    }

    function tweetResourceGetter(resource, query) {
        return getTweetResource.bind(undefined, resource, query);
    }

    function getTweetResource(resource, query) {
        var last_id = apiResources[resource].since_id;
        if (last_id !== "0") {
            query.since_id = last_id;
        }
        client.get(resource, query, function(error, data, response) {
            if (data) {
                apiResources[resource].addData(data);
                apiResources[resource].requestsRemaining = response.headers["x-rate-limit-remaining"];
                apiResources[resource].resetTime = (Number(response.headers["x-rate-limit-reset"]) + 1) * 1000;
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
                    var resourceProfile = data.resources[resourcePaths[idx]]["/" + name];
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

