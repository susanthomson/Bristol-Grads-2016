var express = require("express");
var Twitter = require("twitter");

module.exports = function(port) {
    var app = express();

    app.use(express.static("client"));

    var client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });

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

    function getTweets() {
        return [{test: "object"}];
    }

    return app.listen(port);
};

