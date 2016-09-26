(function () {
    angular.module("TwitterWallApp", ["angularMoment", "ngSanitize", "ngMaterial", "ngRoute"])
    .filter("left", function () {
        return function (tweets) {
            var filtered = [];
            for (var i = 0; i < tweets.length; i++) {
                var tweet = tweets[i];
                if (tweet.id_str.charAt(15) === "1" || tweet.id_str.charAt(15) === "2" || tweet.id_str.charAt(15) === "3") {
                    filtered.push(tweet);
                }
            }
            return filtered;
        };
    })
    .filter("middle", function () {
        return function (tweets) {
            var filtered = [];
            for (var i = 0; i < tweets.length; i++) {
                var tweet = tweets[i];
                if (tweet.id_str.charAt(15) === "4" || tweet.id_str.charAt(15) === "5" ||
                        tweet.id_str.charAt(15) === "6" || tweet.id_str.charAt(15) === "7") {
                    filtered.push(tweet);
                }
            }
            return filtered;
        };
    })
    .filter("right", function () {
        return function (tweets) {
            var filtered = [];
            for (var i = 0; i < tweets.length; i++) {
                var tweet = tweets[i];
                if (tweet.id_str.charAt(15) === "8" || tweet.id_str.charAt(15) === "9" || tweet.id_str.charAt(15) === "0") {
                    filtered.push(tweet);
                }
            }
            return filtered;
        };
    });

})();
