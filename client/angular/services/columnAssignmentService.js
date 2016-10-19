(function() {
    angular
        .module("TwitterWallApp")
        .factory("columnAssignmentService", columnAssignmentService);

    columnAssignmentService.$inject = ["tweetInfoService"];

    function columnAssignmentService(tweetInfoService) {
        return {
            ColumnData: ColumnData,
            assignColumns: assignColumns,
            sortColumns: sortColumns,
            backfillColumns: backfillColumns,
        };

        // Metadata for an individual tweet column
        function ColumnData(slots, selector, ordering, extraContentSpacing) {
            this.slots = slots;
            this.selector = selector;
            this.ordering = ordering;
            //variable to keep track of extra content in each column, eg the logo and "get involved" message
            //units are vh, a percentage of the column height e.g. 0.2 means 20% of the column space should be ignored
            this.extraContentSpacing = extraContentSpacing;
        }

        function assignColumns(tweets, columnDataList) {
            // Set columnList to an array of length equal to columnDataList, consisting of empty arrays
            var columnList = columnDataList.map(function() {
                return [];
            });
            tweets.forEach(function(tweet) {
                // Find the index of the first column that matches the tweet
                var columnIndex = columnDataList.findIndex(function(columnData) {
                    return columnData.selector(tweet);
                });
                if (columnIndex !== -1) {
                    columnList[columnIndex].push(tweet);
                }
            });
            return columnList;
        }

        function sortColumns(columnList, columnDataList) {
            return columnList.map(function(column, idx) {
                return sortColumn(column, columnDataList[idx]);
            });
        }

        function sortColumn(column, columnData) {
            return column.slice().sort(columnData.ordering);
        }

        // Does not use caching, as performance is generally bounded by the number of slots, not the number of tweets
        function backfillColumns(columnList, columnDataList, showAllImages) {
            var maxAssignmentFailures = 50;
            var filledColumnList = columnDataList.map(function() {
                return [];
            });
            // The remaining number of slots for assignment in each backfilled column
            var freeSlots = columnDataList.map(function(columnData) {
                return columnData.slots;
            });
            // The total number of free slots across all columns
            var totalFreeSlots = function() {
                return columnList.map(function(column, columnIdx) {
                    return freeSlots[columnIdx];
                }).reduce(function(a, b) {
                    return a + b;
                });
            };
            // Determines whether overflowed tweets from a column should take priority over tweets in other columns
            var important = columnList.map(function() {
                return false;
            });
            // Set true for the pinned column
            important[0] = true;
            // Tweets that have already been assigned
            var assignedTweets = columnList.map(function() {
                return {};
            });
            var assignTweet = function(sourceColumnIdx, sourceTweetIdx, targetColumnIdx) {
                filledColumnList[targetColumnIdx].push(columnList[sourceColumnIdx][sourceTweetIdx]);
                assignedTweets[sourceColumnIdx][sourceTweetIdx] = true;
                freeSlots[targetColumnIdx] -= weight(columnList[sourceColumnIdx][sourceTweetIdx], showAllImages);
            };
            // Populate each column with as many important and assigned tweets as will fit
            columnList.forEach(function(column, columnIdx) {
                var nextTweetIdx = 0;
                var assignmentFailures = 0;
                while (freeSlots[columnIdx] > 0 && nextTweetIdx < column.length && assignmentFailures < maxAssignmentFailures) {
                    if (weight(column[nextTweetIdx], showAllImages) <= freeSlots[columnIdx]) {
                        assignTweet(columnIdx, nextTweetIdx, columnIdx);
                    } else {
                        assignmentFailures++;
                    }
                    nextTweetIdx += 1;
                }
                if (important[columnIdx]) {
                    nextTweetIdx = 0;
                    assignmentFailures = 0;
                    while (totalFreeSlots() > 0 && nextTweetIdx < column.length && assignmentFailures < maxAssignmentFailures) {
                        if (!assignedTweets[columnIdx][nextTweetIdx]) {
                            var targetColumnIdx = columnList.length - 1;
                            while (targetColumnIdx > columnIdx && !assignedTweets[columnIdx][nextTweetIdx]) {
                                if (weight(column[nextTweetIdx], showAllImages) <= freeSlots[targetColumnIdx]) {
                                    assignTweet(columnIdx, nextTweetIdx, targetColumnIdx);
                                } else {
                                    targetColumnIdx--;
                                }
                            }
                            if (!assignedTweets[columnIdx][nextTweetIdx]) {
                                assignmentFailures++;
                            }
                        }
                        nextTweetIdx++;
                    }
                }
            });
            // Backfill from other columns if necessary
            columnList.forEach(function(column, columnIdx) {
                var nextTweetIdx = 0;
                var assignmentFailures = 0;
                while (totalFreeSlots() > 0 && nextTweetIdx < column.length && assignmentFailures < maxAssignmentFailures) {
                    if (!assignedTweets[columnIdx][nextTweetIdx]) {
                        var targetColumnIdx = columnList.length - 1;
                        while (targetColumnIdx >= 0 && !assignedTweets[columnIdx][nextTweetIdx]) {
                            if (
                                targetColumnIdx !== columnIdx &&
                                weight(column[nextTweetIdx], showAllImages) <= freeSlots[targetColumnIdx]
                            ) {
                                assignTweet(columnIdx, nextTweetIdx, targetColumnIdx);
                            } else {
                                targetColumnIdx--;
                            }
                        }
                        if (!assignedTweets[columnIdx][nextTweetIdx]) {
                            assignmentFailures++;
                        }
                    }
                    nextTweetIdx++;
                }
            });
            return filledColumnList;
        }

        function weight(tweet, showAllImages) {
            return tweetInfoService.tweetHasImage(tweet, showAllImages) ? 2 : 1;
        }
    }

})();
