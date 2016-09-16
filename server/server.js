var express = require("express");
var Twitter = require("twitter");
var cookieParser = require("cookie-parser");


module.exports = function(port, googleAuthoriser) {
    var app = express();

    var adminToken;

    app.use(express.static("client"));
    app.use(cookieParser());

    app.get("/oauth", function(req, res) {
        googleAuthoriser.authorise(req, function(err, token) {
            if (!err) {
                console.log("success");
                adminToken = token;
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
            if (req.cookies.sessionToken === adminToken) {
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

    return app.listen(port);
};

