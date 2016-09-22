(function () {
	/* global require */

	angular.module("TwitterWallApp", ["angularMoment", "ngSanitize", "ngMaterial", "ngRoute"]);

	require("./config/routeConfig.js");
	require("./controllers/AdminController.js");
	require("./controllers/MainController.js");
	require("./services/adminDashDataService.js");
	require("./services/tweetTextManipulationService.js");
	require("./services/twitterWallDataService.js");

})();
