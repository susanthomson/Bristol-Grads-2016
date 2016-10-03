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
            getTweets: getTweets,
            setDeletedStatus: setDeletedStatus,
            blockedUsers: blockedUsers,
            addBlockedUser: addBlockedUser,
            removeBlockedUser: removeBlockedUser,
            addSpeaker: addSpeaker,
            getSpeakers: getSpeakers,
            removeSpeaker: removeSpeaker,
            setPinnedStatus: setPinnedStatus

        };

        function blockedUsers() {
            return $http.get("/admin/blocked").then(function(result) {
                return result.data;
            });
        }

        function removeBlockedUser(user) {
            return $http.post("/admin/blocked/remove", {
                user: user
            }, {
                headers: {
                    "Content-type": "application/json"
                }
            });
        }

        function addBlockedUser(name, screen_name) {
            return $http.post("/admin/blocked/add", {
                user: {
                    name: name,
                    screen_name: screen_name
                }
            }, {
                headers: {
                    "Content-type": "application/json"
                }
            });
        }

        function authenticate() {
            return $http.get("/admin");
        }

        function logOut() {
            return $http.post("/admin/logout");
        }

        function getAuthUri() {
            return $http.get("/api/oauth/uri").then(function(result) {
                return result.data.uri;
            });
        }

        function getTweets(since) {
            var query = {};
            if (since) {
                query.since = since;
            }
            return $http.get("/api/tweets", {
                params: query
            }).then(function(result) {
                return result.data;
            });
        }

        function setDeletedStatus(id, deleted) {
            return $http.post("/admin/tweets/delete", {
                id: id,
                deleted: deleted,
            }, {
                headers: {
                    "Content-type": "application/json"
                }
            });
        }

        function getSpeakers() {
            return $http.get("/api/speakers").then(function(result) {
                return result.data;
            });
        }

        function addSpeaker(name) {
            return $http.post("/admin/speakers/add", {
                name: name,
            }, {
                headers: {
                    "Content-type": "application/json"
                }
            });
        }

        function removeSpeaker(name) {
            return $http.post("/admin/speakers/remove", {
                name: name,
            }, {
                headers: {
                    "Content-type": "application/json"
                }
            });
        }

        function setPinnedStatus(id, pinned) {
            return $http.post("/admin/tweets/pin", {
                id: id,
                pinned: pinned
            });
        }
    }
})();
