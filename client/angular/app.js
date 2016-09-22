(function () {
	/* global require */

	require("config/routeConfig.js");
	require("controllers/AdminController.js");
	require("controllers/MainController.js");
	require("services/adminDashDataService.js");
	require("tweetTextManipulationService.js");
	require("twitterWallDataService.js");

	angular.module("TwitterWallApp", ["angularMoment", "ngSanitize", "ngMaterial", "ngRoute"]);
})();
