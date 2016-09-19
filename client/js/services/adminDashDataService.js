(function() {
    angular
        .module("TwitterWallAdminApp")
        .factory("twitterWallAdminDataService", twitterWallAdminDataService);

    twitterWallAdminDataService.$inject = ["$http"];

    function twitterWallAdminDataService($http) {
        return {
            authenticate: authenticate,
            getAuthUri: getAuthUri,
            setMotd: setMotd,
        };

        function authenticate() {
            return $http.get("/admin");
        }

        function getAuthUri() {
            return $http.get("/api/oauth/uri");
        }

        function setMotd(message) {
            return $http.post("/admin/motd", {
                motd: message,
            }, {
                headers: {"Content-type": "application/json"}
            });
        }
    }

})();

