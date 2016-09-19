var server = require("./server/server");
var oAuthGoogle = require("./server/oauth-google");
var Twitter = require("twitter");

var port = process.env.PORT || 8080;
var oauthClientId = "627385202945-oqedl0onib41h39quc15pufqgqp8j8cu.apps.googleusercontent.com";
var oauthSecret =  process.env.TWEET_WALL_OAUTH_SECRET;

var twitterClient = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

var googleAuthoriser = oAuthGoogle(oauthClientId, oauthSecret);
server(port, twitterClient, googleAuthoriser);

console.log("Server running on port " + port);
