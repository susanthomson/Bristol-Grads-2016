var express = require("express");
var Twitter = require("twitter");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");

module.exports = function(port, googleAuthoriser) {
    var app = express();

    var adminSessions = {};

    app.use(express.static("client"));
    app.use(cookieParser());
    app.use(bodyParser.json());

    app.get("/oauth", function(req, res) {
        googleAuthoriser.authorise(req, function(err, token) {
            if (!err) {
                console.log("success");
                adminSessions[token] = true;
                res.cookie("sessionToken", token);
                res.header("Location", "/dash.html");
                res.sendStatus(302);
            }
            else {
                console.log(err);
                res.sendStatus(400);
            }
        });
    });

    app.get("/api/oauth/uri", function(req, res) {
        res.json({
            uri: googleAuthoriser.oAuthUri
        });
    });

    app.use("/admin", function(req, res, next) {
        if (req.cookies.sessionToken) {
            if (adminSessions[req.cookies.sessionToken]) {
                next();
            } else {
                res.sendStatus(401);
            }
        } else {
            res.sendStatus(401);
        }
    });

    app.get("/admin", function(req, res) {
        res.sendStatus(200);
    });

    var motd = "hello from the admin";
    app.get("/api/motd", function(req, res) {
        res.json(motd);
    });

    app.post("/admin/motd", function(req, res) {
        if (req.body.motd) {
            motd = req.body.motd;
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    });

    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

    var tweetStore = [];
    var hashtags = ["#bristech", "#bristech2016"];
    var sinceIdH;
    var sinceId;

    app.get("/api/test", function(req, res) {
        client.get("statuses/user_timeline", {screen_name: "bristech"}, function(error, tweets, response) {
            if (tweets) {
                res.json(tweets);
            } else {
                res.sendStatus(500);
            }
        });
    });

    app.get("/api/tweets", function(req, res) {
        res.json(getTweets());
    });

    app.get("/api/test/hashtag", function(req, res) {
        var result = [];
        var query = {
            q: hashtags.join(" OR "),
            count: 2
        };
        client.get("search/tweets", query, function(error, tweets, response) {
            if (tweets) {
                tweets.statuses.forEach(function(tweet) {
                    result.push(tweet);
                });
                res.json(result);
            } else {
                console.log(error);
            }
        });
    });

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

    function getTweets() {
        return tweetStore;
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

    getTweetsFrom("bristech");
    var refresh = setInterval(function () {
        getTweetsFrom("bristech");
        getTweetsWithHashtag();
    } , 30000); //super conservative for now

    return app.listen(port);
};

