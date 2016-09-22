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
            deleteMediaLink: deleteMediaLink,
            sortByDate: sortByDate
        };

        function sortByDate(tweet) {
            return new Date(tweet.created_at);
        }

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
