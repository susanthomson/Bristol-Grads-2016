(function() {
    angular
        .module("TwitterWallApp")
        .factory("columnAssignmentService", columnAssignmentService);

    columnAssignmentService.$inject = ["tweetInfoService"];

    function columnAssignmentService(tweetInfoService) {

        var cachedAssignedColumns = false;
        var cachedSortedColumns = false;
        var cachedBackfilledColumns = false;

        return {
            ColumnData: ColumnData,
            assignColumns: assignColumns,
            sortColumns: sortColumns,
            backfillColumns: backfillColumns,
            clearCache: clearCache,
        };

        function clearCache() {
            cachedAssignedColumns = false;
            cachedSortedColumns = false;
            cachedBackfilledColumns = false;
        }

        // Metadata for an individual tweet column
        function ColumnData(slots, selector, ordering, extraContentSpacing, important) {
            this.slots = slots;
            this.selector = selector;
            this.ordering = ordering;
            //variable to keep track of extra content in each column, eg the logo and "get involved" message
            //units are vh, a percentage of the column height e.g. 0.2 means 20% of the column space should be ignored
            this.extraContentSpacing = extraContentSpacing;
            // Determines whether overflowed tweets from a column should take priority over tweets in other columns
            this.important = important;
        }

        function assignColumns(tweets, columnDataList, diffOnly) {
            // Set columnList to an array of length equal to columnDataList, consisting of empty arrays
            var columnList;
            if (diffOnly) {
                if (cachedAssignedColumns === false) {
                    throw new Error("Attempted to access empty cache in column assignment!");
                }
                // Set columnList to the cached assigned columns sans the changed Tweets
                var diffTweets = tweets.slice();
                columnList = columnDataList.map(function(columnData, idx) {
                    // Filter the cached columns for tweets contained in diffTweets, splicing tweets out of diffTweets 
                    // when they are found for efficiency
                    return cachedAssignedColumns[idx].filter(function(tweet) {
                        var foundIndex = diffTweets.findIndex(function(searchTweet) {
                            return searchTweet.id_str === tweet.id_str;
                        });
                        if (foundIndex !== -1) {
                            diffTweets.splice(foundIndex, 1);
                            return false;
                        }
                        return true;
                    });
                });
            } else {
                // Set columnList as a list of empty columns as there are no "saved" tweets
                columnList = columnDataList.map(function() {
                    return [];
                });
            }
            // Add tweets to the columnList
            tweets.forEach(function(tweet) {
                // Find the index of the first column that matches the tweet
                var columnIndex = columnDataList.findIndex(function(columnData) {
                    return columnData.selector(tweet);
                });
                if (columnIndex !== -1) {
                    columnList[columnIndex].push(tweet);
                }
            });
            // Cache the results
            cachedAssignedColumns = columnList.map(function(column) {
                return column.slice();
            });
            return columnList;
        }

        function sortColumns(columnList, columnDataList, diffOnly) {
            var sortedColumns;
            if (diffOnly) {
                if (cachedSortedColumns === false) {
                    throw new Error("Attempted to access empty cache in column sorting!");
                }
                // TODO make it more explicit that a column diff is being used instead of an actual column
                sortedColumns = columnList.map(function(columnDiff, idx) {
                    var sortedColumn = [];

                    // Tweets to filter from the cached column
                    var removedTweets = columnDiff.removed.slice();

                    // New tweets are sorted according to the column's sort, in order to make their insertion efficient
                    var sortedAddedTweets = sortColumn(columnDiff.added, columnDataList[idx]);

                    // Copy contents of the cached column into the new column, filtering out tweets in
                    // removedTweets and inserting tweets in sortedAddedTweets into the correct sorted position
                    cachedSortedColumns[idx].forEach(function(tweet) {
                        // Move all the tweets from sortedAddedTweets that fit the current position into the new column
                        while (sortedAddedTweets.length > 0 && columnDataList[idx].ordering(sortedAddedTweets[0], tweet) < 0) {
                            sortedColumn.push(sortedAddedTweets.shift());
                        }
                        // Don't insert a tweet if it exists in removedTweets
                        var foundRemovedIndex = removedTweets.findIndex(function(searchTweet) {
                            return searchTweet.id_str === tweet.id_str;
                        });
                        if (foundRemovedIndex !== -1) {
                            // Remove already filtered tweets from removedTweets for efficiency
                            removedTweets.splice(foundRemovedIndex, 1);
                        } else {
                            // Add the current tweet to the new column
                            sortedColumn.push(tweet);
                        }
                    });
                    return sortedColumn;
                });
            } else {
                sortedColumns = columnList.map(function(column, idx) {
                    return sortColumn(column, columnDataList[idx]);
                });
            }
            cachedSortedColumns = sortedColumns;
            return sortedColumns;
        }

        function sortColumn(column, columnData) {
            return column.slice().sort(columnData.ordering);
        }

        // Does not use caching, as performance is generally bounded by the number of slots, not the number of tweets
        function backfillColumns(columnList, columnDataList, showAllImages) {
            // Upper bound on the number of times the algorithm will attempt to fill a slot, handling the extreme edge
            // case that there a large number of tweets that will not fit on the wall
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
                return freeSlots.reduce(function(a, b) {
                    return a + b;
                });
            };
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
                if (columnDataList[columnIdx].important) {
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
