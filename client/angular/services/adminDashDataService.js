(function() {
    angular
        .module("TwitterWallApp")
        .factory("adminDashDataService", adminDashDataService);

    adminDashDataService.$inject = ["$http"];

    function adminDashDataService($http) {
        return {
            authenticate: authenticate,
            logOut: logOut,
            getAuthUri: getAuthUri,
            setMotd: setMotd,
            getTweets: getTweets,
            getMotd: getMotd,
            deleteTweet: deleteTweet
        };

        function authenticate() {
            return $http.get("/admin");
        }

        function logOut() {
            return $http.get("/admin/logout");
        }

        function getAuthUri() {
            return $http.get("/api/oauth/uri").then(function(result) {
                return result.data.uri;
            });
        }

        function setMotd(message) {
            return $http.post("/admin/motd", {
                motd: message,
            }, {
                headers: {"Content-type": "application/json"}
            });
        }

        function getTweets(since) {
            var query = {
                includeDeleted: true,
            };
            if (since) {
                query.since = since;
            }
            return $http.get("/api/tweets", {params: query}).then(function(result) {
                return result.data;
            });
        }

        function getMotd() {
            return $http.get("/api/motd").then(function(result) {
                return result.data;
            });
        }

        function deleteTweet(id) {
            return $http.post("/admin/tweets/delete", {
                id: id,
            }, {
                headers: {"Content-type": "application/json"}
            });
        }

    }

})();

