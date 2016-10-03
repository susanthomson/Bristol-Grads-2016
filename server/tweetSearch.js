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

    function findLast(arr, predicate, thisArg) {
        for (var idx = arr.length - 1; idx >= 0; idx--) {
            if (predicate.call(thisArg, arr[idx], idx, arr)) {
                return arr[idx];
            }
        }
    }

    function setTweetStatus(tweetId, status) {
        var modifiedTweet = findLast(tweetStore, function(tweet) {
            return tweet.id_str === tweetId;
        });
        if (!modifiedTweet) {
            throw new Error("Cannot modify tweet that the server does not have.");
        }
        // Ignore the update if everything in `status` is already set for the tweet
        tweetUpdates.push({
            type: "tweet_status",
            since: new Date(),
            id: tweetId,
            status: status,
        });
    }

    function setDeletedStatus(tweetId, deleted) {
        setTweetStatus(tweetId, {
            deleted: deleted
        });
    }

    function setPinnedStatus(tweetId, pinned) {
        setTweetStatus(tweetId, {
            pinned: pinned
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

    var hashtagUpdateFn = tweetResourceGetter("search/tweets", {
        q: hashtags.concat(mentions).join(" OR ")
    });
    var timelineUpdateFn = tweetResourceGetter("statuses/user_timeline", {
        screen_name: "bristech"
    });

    loadSpeakers(speakerFile, function() {
        getApplicationRateLimits(function() {
            resourceUpdate("search/tweets", hashtagUpdateFn, searchUpdater);
            resourceUpdate("statuses/user_timeline", timelineUpdateFn, userUpdater);
        });
    });

    return {
        getTweetData: getTweetData,
        setDeletedStatus: setDeletedStatus,
        setPinnedStatus: setPinnedStatus,
        loadTweets: loadTweets,
        getBlockedUsers: getBlockedUsers,
        addBlockedUser: addBlockedUser,
        removeBlockedUser: removeBlockedUser,
        getSpeakers: getSpeakers,
        addSpeaker: addSpeaker,
        removeSpeaker: removeSpeaker,
        displayBlockedTweet: displayBlockedTweet
    };

    function getBlockedUsers() {
        return blockedUsers;
    }

    function addBlockedUser(user) {
        if (!blockedUsers.find(function(blockedUser) {
                return blockedUser.screen_name === user.screen_name;
            })) {
            tweetUpdates.push({
                type: "user_block",
                since: new Date(),
                screen_name: user.screen_name,
                blocked: true,
            });
            blockedUsers.push(user);
        } else {
            console.log("User " + user.screen_name + " already blocked");
        }
    }

    function removeBlockedUser(user) {
        if (!blockedUsers.find(function(blockedUser) {
                return blockedUser.screen_name === user.screen_name;
            })) {
            return;
        }
        tweetUpdates.push({
            type: "user_block",
            since: new Date(),
            screen_name: user.screen_name,
            blocked: false,
        });
        blockedUsers = blockedUsers.filter(function(usr) {
            return usr.screen_name !== user.screen_name;
        });
    }

    function displayBlockedTweet(tweetId) {
        setTweetStatus(tweetId, {
            display: true
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

    function getTweetData(since, maxTweets) {
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
        var newTweetUpdates = updates.filter(function(update) {
            return update.type === "new_tweets";
        });
        var tweets = [];
        if (newTweetUpdates.length > 0) {
            var minStartIdx = tweetStore.length - maxTweets > 0 ? tweetStore.length - maxTweets : 0;
            var startIdx = newTweetUpdates[0].startIdx < minStartIdx ?
                minStartIdx :
                newTweetUpdates[0].startIdx;
            tweets = tweetStore.slice(startIdx);
        }
        return {
            tweets: tweets,
            updates: updates,
        };
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
        var resourcePaths = resourceNames.map(function(resourceName) {
            return apiResources[resourceName].basePath;
        });
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

    function loadSpeakers(location, callback) {
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
            callback();
        });
    }

    function addSpeaker(name) {
        tweetUpdates.push({
            type: "speaker_update",
            since: new Date(),
            screen_name: name,
            operation: "add"
        });
        speakers.push(name);
        writeToFile();
    }

    function removeSpeaker(name) {
        if (speakers.indexOf(name) > -1) {
            tweetUpdates.push({
                type: "speaker_update",
                since: new Date(),
                screen_name: name,
                operation: "remove"
            });
            speakers.splice(speakers.indexOf(name), 1);
            writeToFile();
        } else {
            console.log("ERROR : Speaker not found in the speakers list");
        }
    }

    function writeToFile() {
        fs.writeFile(speakerFile, JSON.stringify({
            "speakers": speakers
        }), function(err) {
            if (err) {
                console.log("Error writing speaker file" + err);
            }
        });
    }

    function getSpeakers() {
        return speakers;
    }

};
