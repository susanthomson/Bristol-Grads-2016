(function() {
    angular
        .module("TwitterWallApp")
        .factory("tweetInfoService", tweetInfoService);

    tweetInfoService.$inject = [];

    function tweetInfoService() {
        return {
            tweetHasImage: tweetHasImage,
        };

        function tweetHasImage(tweet, showAllImages) {
            try {
                return tweet.entities.media[0].media_url_https && (!tweet.hide_image || showAllImages);
            } catch (err) {
                return false;
            }
        }
    }

})();
