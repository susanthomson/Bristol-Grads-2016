/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	__webpack_require__(3);
	__webpack_require__(4);
	__webpack_require__(5);
	__webpack_require__(6);
	__webpack_require__(7);


/***/ },
/* 1 */
/***/ function(module, exports) {

	(function () {

	angular.module("TwitterWallApp", ["angularMoment", "ngSanitize", "ngMaterial", "ngRoute"]);

	})();


/***/ },
/* 2 */
/***/ function(module, exports) {

	angular.module("TwitterWallApp").config(["$routeProvider", "$locationProvider",
	    function($routeProvider, $locationProvider) {
	        $routeProvider
	            .when("/", {
	                templateUrl: "/templates/clientTweetWall.html",
	                controller: "MainController"
	            })
	            .when("/dash", {
	                templateUrl: "/templates/adminTweetWall.html",
	                controller: "AdminController"

	            })
	            .when("/dash/:status", {
	                templateUrl: "/templates/adminTweetWall.html",
	                controller: "AdminController"

	            })
	            .otherwise({
	                templateUrl: "/templates/clientTweetWall.html",
	                controller: "MainController"
	            });
	    }
	]);


/***/ },
/* 3 */
/***/ function(module, exports) {

	(function () {

	    angular.module("TwitterWallApp").controller("AdminController", AdminController);

	    AdminController.$inject = ["$scope", "adminDashDataService", "$sce", "tweetTextManipulationService", "$routeParams"];

	    function AdminController($scope, adminDashDataService, $sce, tweetTextManipulationService, $routeParams) {
	        $scope.loggedIn = false;
	        $scope.ctrl = {};
	        $scope.tweets = [];
	        $scope.motd = "";
	        $scope.errorMessage = "";

	        $scope.deleteTweet = adminDashDataService.deleteTweet;

	        adminDashDataService.authenticate().then(function () {
	            $scope.loggedIn = true;
	        }, function () {
	            adminDashDataService.getAuthUri().then(function (uri) {
	                if ($routeParams.status === "unauthorised") {
	                    $scope.errorMessage = "This account is not authorised, please log in with an authorised account";
	                }
	                $scope.loginUri = uri;
	            });
	        });

	        adminDashDataService.getTweets().then(function (tweets) {
	            $scope.tweets = tweets;
	            if ($scope.tweets.length > 0) {
	                $scope.tweets.forEach(function (tweet) {
	                    tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
	                });
	            }
	        });

	        adminDashDataService.getMotd().then(function (motd) {
	            $scope.motd = motd;
	        });

	        $scope.setMotd = function () {
	            adminDashDataService.setMotd($scope.ctrl.motd).then(function (result) {
	                $scope.ctrl.motd = "";
	                adminDashDataService.getMotd().then(function (motd) {
	                    $scope.motd = motd;
	                });
	            });
	        };
	    }
	})();


/***/ },
/* 4 */
/***/ function(module, exports) {

	(function () {
	angular.module("TwitterWallApp").controller("MainController", MainController);

	MainController.$inject = ["$scope", "twitterWallDataService", "$sce", "tweetTextManipulationService"];

	function MainController($scope, twitterWallDataService, $sce, tweetTextManipulationService) {
	    $scope.tweets = [];

	    twitterWallDataService.getTweets().then(function (tweets) {
	        $scope.tweets = tweets;
	        if ($scope.tweets.length > 0) {
	            $scope.tweets.forEach(function (tweet) {
	                tweet.text = $sce.trustAsHtml(tweetTextManipulationService.updateTweet(tweet));
	            });
	        }
	    });

	    twitterWallDataService.getMotd().then(function (motd) {
	        $scope.motd = motd;
	    });
	}
	})();


/***/ },
/* 5 */
/***/ function(module, exports) {

	(function () {
	angular
	    .module("TwitterWallApp")
	    .factory("adminDashDataService", adminDashDataService);

	adminDashDataService.$inject = ["$http"];

	function adminDashDataService($http) {
	    return {
	        authenticate: authenticate,
	        getAuthUri: getAuthUri,
	        setMotd: setMotd,
	        getTweets: getTweets,
	        getMotd: getMotd,
	        deleteTweet: deleteTweet
	    };

	    function authenticate() {
	        return $http.get("/admin");
	    }

	    function getAuthUri() {
	        return $http.get("/api/oauth/uri").then(function (result) {
	            return result.data.uri;
	        });
	    }

	    function setMotd(message) {
	        return $http.post("/admin/motd", {
	            motd: message,
	        }, {
	            headers: {
	                "Content-type": "application/json"
	            }
	        });
	    }

	    function getTweets() {
	        return $http.get("/api/tweets").then(function (result) {
	            return result.data;
	        });
	    }

	    function getMotd() {
	        return $http.get("/api/motd").then(function (result) {
	            return result.data;
	        });
	    }

	    function deleteTweet(id) {
	        return $http.post("/admin/tweets/delete", {
	            id: id,
	        }, {
	            headers: {
	                "Content-type": "application/json"
	            }
	        });
	    }

	}

	})();


/***/ },
/* 6 */
/***/ function(module, exports) {

	(function () {
	angular
	    .module("TwitterWallApp")
	    .factory("tweetTextManipulationService", tweetTextManipulationService);

	function tweetTextManipulationService() {
	    return {
	        updateTweet: updateTweet,
	        addHashtag: addHashtag,
	        addMention: addMention,
	        addUrl: addUrl,
	        deleteMediaLink: deleteMediaLink
	    };

	    function updateTweet(tweet) {
	        tweet.text = addHashtag(tweet.text, tweet.entities.hashtags);
	        tweet.text = addMention(tweet.text, tweet.entities.user_mentions);
	        tweet.text = addUrl(tweet.text, tweet.entities.urls);
	        if (tweet.entities.media) {
	            tweet.text = deleteMediaLink(tweet.text, tweet.entities.media);
	        }
	        return tweet.text;
	    }

	    function addHashtag(str, hashtags) {
	        hashtags.forEach(function (hashtag) {
	            var substr = hashtag.text;
	            str = str.split("#" + substr).join(" <b>#" + substr + "</b> ");
	        });
	        return str;
	    }

	    function addMention(str, mentions) {
	        mentions.forEach(function (mention) {
	            var substr = mention.screen_name;
	            str = str.split("@" + substr).join(" <b>@" + substr + "</b> ");
	        });
	        return str;
	    }

	    function addUrl(str, urls) {
	        urls.forEach(function (uri) {
	            var substr = uri.url;
	            str = str.split(substr).join(" <b>" + uri.display_url + "</b> ");
	        });
	        return str;
	    }

	    function deleteMediaLink(str, media) {
	        media.forEach(function (m) {
	            str = str.split(m.url).join("");
	        });
	        return str;
	    }

	}

	})();


/***/ },
/* 7 */
/***/ function(module, exports) {

	(function () {
	angular
	    .module("TwitterWallApp")
	    .factory("twitterWallDataService", twitterWallDataService);

	twitterWallDataService.$inject = ["$http"];

	function twitterWallDataService($http) {
	    return {
	        getTweets: getTweets,
	        getMotd: getMotd,
	    };

	    function getTweets() {
	        return $http.get("/api/tweets").then(function (result) {
	            return result.data;
	        });
	    }

	    function getMotd() {
	        return $http.get("/api/motd").then(function (result) {
	            return result.data;
	        });
	    }
	}

	})();


/***/ }
/******/ ]);