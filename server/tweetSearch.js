module.exports = function(client, fs, speakerFile) {
    var tweetStore = [];
    var tweetUpdates = [];
    var hashtags = ["#bristech", "#bristech2016"];
    var mentions = ["@bristech"];
    var blockedUsers = [];
    var speakers = [];
    var officialUsers = ["bristech"];

    function tweetType(tweet) {
        if (officialUsers.indexOf(tweet.user.screen_name) !== -1) {
            return "official";
        }
        var foundHashtag = hashtags.reduce(function(found, hashtag) {
            return found || tweet.entities.hashtags.reduce(function(match, tweetHashtag) {
                return match || hashtag.slice(1).toUpperCase() === tweetHashtag.text.toUpperCase();
            }, false);
        }, false);
        if (foundHashtag) {
            return "tagged";
        }
        var foundMention = mentions.reduce(function(found, mention) {
            return found || tweet.entities.user_mentions.reduce(function(match, userMention) {
                return match || mention.slice(1).toUpperCase() === userMention.screen_name.toUpperCase();
            }, false);
        }, false);
        if (foundMention) {
            return "tagged";
        }
        return "";
    }

    function addTweetItem(tweets, tag) {
        if (tweets.length === 0) {
            return;
        }
        tweetUpdates.push({
            type: "new_tweets",
            since: new Date(),
            tag: tag,
            startIdx: tweetStore.length,
        });
        tweetStore = tweetStore.concat(tweets);
    }

    function deleteTweet(tweetId) {
        // Not really a necessary check, and can be taken out if the performance hit becomes too large, but acts as a
        // way of preventing deletes of tweets that haven't appeared yet.
        // This is important, as such deletes would result in tweets disappearing from queries as the "since" time is
        // moved back - which would be an unintuitive and confusing behaviour.
        var deletedTweet = tweetStore.find(function(tweet) {
            return tweet.id_str === tweetId;
        });
        if (!deletedTweet) {
            throw new Error("Cannot delete tweet that the server does not have.");
        }
        // The actual point of the function
        tweetUpdates.push({
            type: "tweet_status",
            since: new Date(),
            id: tweetId,
            status: {
                deleted: true,
            },
        });
    }

    // Compares two strings that represent numbers of greater size than can be handled as `number` types without loss
    // of precision, and returns true if the first is numerically greater than the second
    function idStrComp(a, b) {
        if (Number(a) === Number(b)) {
            return a > b;
        }
        return Number(a) > Number(b);
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
                var taggedTweets = tweets.statuses.filter(function(tweet) {
                    return tweetType(tweet) === "tagged";
                });
                addTweetItem(taggedTweets, "tagged");
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
                var officialTweets = tweets.filter(function(tweet) {
                    return tweetType(tweet) === "official";
                });
                addTweetItem(officialTweets, "official");
            }
        },
    };

    var searchUpdater;
    var userUpdater;

    var hashtagUpdateFn = tweetResourceGetter("search/tweets", {q: hashtags.concat(mentions).join(" OR ")});
    var timelineUpdateFn = tweetResourceGetter("statuses/user_timeline", {screen_name: "bristech"});

    loadSpeakers(speakerFile);

    getApplicationRateLimits(function() {
        resourceUpdate("search/tweets", hashtagUpdateFn, searchUpdater);
        resourceUpdate("statuses/user_timeline", timelineUpdateFn, userUpdater);
    });

    return {
        getTweetData: getTweetData,
        deleteTweet: deleteTweet,
        loadTweets: loadTweets,
        getBlockedUsers: getBlockedUsers,
        addBlockedUser: addBlockedUser,
        removeBlockedUser: removeBlockedUser,
        filterByBlockedUsers: filterByBlockedUsers,
        getSpeakers: getSpeakers,
        addSpeaker: addSpeaker,
        removeSpeaker: removeSpeaker,
    };

    function getBlockedUsers() {
        return blockedUsers;
    }

    function addBlockedUser(user) {
        tweetUpdates.push({
            type: "user_block",
            since: new Date(),
            screen_name: user.screen_name
        });
        blockedUsers.push(user);
    }

    function removeBlockedUser(user) {
        blockedUsers = blockedUsers.filter(function(usr) {
            return usr.screen_name !== user.screen_name;
        });
    }

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

    function loadTweets(tweets, type) {
        addTweetItem(tweets, type);
    }

    function getTweetStore() {
        return tweetStore;
    }

    function getTweetData(since, includeDeleted) {
        includeDeleted = includeDeleted === true;
        since = since || new Date(0);
        var updateIdx = tweetUpdates.findIndex(function(update) {
            return update.since > since;
        });
        if (updateIdx === -1) {
            return {
                tweets: [],
                updates: [],
            };
        }
        var updates = tweetUpdates.slice(updateIdx);
        var statusUpdates = updates.filter(function(update) {
            return update.type === "tweet_status";
        });
        var newTweetUpdates = updates.filter(function(update) {
            return update.type === "new_tweets";
        });
        var tweets = [];
        if (newTweetUpdates.length > 0) {
            tweets = tweetStore.slice(newTweetUpdates[0].startIdx);
        }
        var filteredTweets;

        // If `!includeDeleted`, remove deleted tweets from `tweets`, for general ease-of-use
        if (!includeDeleted) {

            //filter by deleted
            filteredTweets = filterByDeleted(tweets, statusUpdates);

            //filter by blocked users
            tweets = filterByBlockedUsers(filteredTweets, blockedUsers);

        }

        return {
            tweets: tweets,
            updates: updates,
        };
    }

    function filterByDeleted(tweets, statusUpdates) {
        var filteredTweets = tweets.filter(function(tweet) {
            var deleted = false;
            statusUpdates.forEach(function(statusUpdate) {
                if (statusUpdate.id === tweet.id_str && statusUpdate.status.deleted !== undefined) {
                    deleted = statusUpdate.status.deleted;
                }
            });
            return !deleted;
        });
        return filteredTweets;
    }

    function filterByBlockedUsers(tweets, blockedUsers) {
        for (var i = 0; i < tweets.length; i++) {
            for (var j = 0; j < blockedUsers.length; j++) {
                if (tweets[i].user.screen_name === blockedUsers[j].screen_name) {
                    tweets.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
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

    function loadSpeakers(location) {
        fs.readFile(location, "utf8", function(err, data) {
            if (err) {
                console.log("Error reading speaker file" + err);
            } else {
                try {
                    speakers = JSON.parse(data).speakers;
                } catch (err) {
                    console.log("Error parsing speaker file" + err);
                }
            }
        });
    }

    function addSpeaker(name) {
        speakers.push(name);
        writeToFile();
    }

    function removeSpeaker(name) {
        if (speakers.indexOf(name) > -1) {
            speakers.splice(speakers.indexOf(name), 1);
            writeToFile();
        } else {
            console.log("ERROR : Speaker not found in the speakers list");
        }
    }

    function writeToFile() {
        fs.writeFile(speakerFile, JSON.stringify({"speakers" : speakers}), function(err) {
            if (err) {
                console.log("Error writing speaker file" + err);
            }
        });
    }

    function getSpeakers() {
        return speakers;
    }

};

