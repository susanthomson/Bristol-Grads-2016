var server = require("./server/server");
var oAuthGoogle = require("./server/oauth-google");

var port = process.env.PORT || 8080;
var oauthClientId = "627385202945-oqedl0onib41h39quc15pufqgqp8j8cu.apps.googleusercontent.com";
var oauthSecret =  process.env.TWEET_WALL_OAUTH_SECRET;

var googleAuthoriser = oAuthGoogle(oauthClientId, oauthSecret);
server(port, googleAuthoriser);

console.log("Server running on port " + port);
