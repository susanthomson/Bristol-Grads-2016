var server = require("./server/server");
var oAuthGoogle = require("./server/oauth-google");
var moment = require('moment');
moment().format();

var port = process.env.PORT || 8080;
var oauthClientId = "627385202945-oqedl0onib41h39quc15pufqgqp8j8cu.apps.googleusercontent.com";
var oauthSecret =  "jYLWRhYuj5e40bMWFvORcbsk";

var googleAuthoriser = oAuthGoogle(oauthClientId, oauthSecret);
server(port, googleAuthoriser);

console.log("Server running on port " + port);
