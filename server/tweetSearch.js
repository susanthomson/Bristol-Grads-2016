module.exports = function(client) {
    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];

    var apiResources = {
        "search/tweets": {
            since_id: 0,
            basePath: "search",
            requestsRemaining: 0,
            resetTime: 0,
            addData: function(tweets) {
                this.since_id = tweets.statuses.reduce(function(since, currTweet) {
                    return since > currTweet.id ? since : currTweet.id;
                }, this.since_id);
                tweetStore = tweetStore.concat(tweets.statuses.sort(function(statusA, statusB) {
                    return statusA.id - statusB.id;
                }));
            }
        },
        "statuses/user_timeline": {
            since_id: 0,
            basePath: "statuses",
            requestsRemaining: 0,
            resetTime: 0,
            addData: function(tweets) {
                this.since_id = tweets.reduce(function(since, currTweet) {
                    return since > currTweet.id ? since : currTweet.id;
                }, this.since_id);
                tweetStore = tweetStore.concat(tweets.sort(function(statusA, statusB) {
                    return statusA.id - statusB.id;
                }));
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

    function getTweetStore() {
        return tweetStore;
    }

    function setTweetStore(value) {
        tweetStore = value;
    }

    function tweetResourceGetter(resource, query) {
        return getTweetResource.bind(undefined, resource, query);
    }

    function getTweetResource(resource, query) {
        var last_id = apiResources[resource].since_id;
        if (last_id > 0) {
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

