(function() {
    angular
        .module("TwitterWallApp")
        .factory("columnAssignmentService", columnAssignmentService);

    columnAssignmentService.$inject = ["tweetInfoService"];

    function columnAssignmentService(tweetInfoService) {

        var store = {};

        return {
            ColumnData: ColumnData,
            assignDisplayColumns: assignDisplayColumns,
            clearStore: clearStore,
            assignColumns: assignColumns,
            sortColumns: sortColumns,
            backfillColumns: backfillColumns,
        };

        function clearStore(storeName) {
            delete store[storeName];
        }

        function assignDisplayColumns(tweets, columnDataList, backfill, showAllImages, storeName) {
            var assignedColumns;
            var sortedColumns;
            if (storeName && store[storeName]) {
                // Recalculate display columns based on previous results
                var reassignResult = reassignColumns(tweets, columnDataList, storeName);
                assignedColumns = reassignResult.columnList;
                sortedColumns = resortColumns(reassignResult.diffList, columnDataList, storeName);
            } else {
                // Calculate display columns from scratch
                assignedColumns = assignColumns(tweets, columnDataList);
                sortedColumns = sortColumns(assignedColumns, columnDataList);
            }
            var displayColumns = backfill ?
                backfillColumns(sortedColumns, columnDataList, showAllImages) :
                sortedColumns.slice();
            if (storeName) {
                store[storeName] = {
                    assignedColumns: assignedColumns,
                    sortedColumns: sortedColumns,
                };
            }
            return displayColumns;
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

        function assignColumns(tweets, columnDataList) {
            // Set columnList to an array of length equal to columnDataList, consisting of empty arrays
            var columnList = columnDataList.map(function() {
                return [];
            });
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
            return columnList;
        }

        function reassignColumns(tweets, columnDataList, storeName) {
            // The full set of differences between the stored column assignments and the new assignments returned here
            var columnDiffList = columnDataList.map(function() {
                return {
                    removed: [],
                    added: [],
                };
            });
            // Set columnList to the stored assigned columns sans the changed Tweets
            var diffTweets = tweets.slice();
            var columnList = columnDataList.map(function(columnData, columnIdx) {
                // Filter the stored columns for tweets contained in diffTweets
                return store[storeName].assignedColumns[columnIdx].filter(function(tweet) {
                    var foundIndex = diffTweets.findIndex(function(searchTweet) {
                        return searchTweet.id_str === tweet.id_str;
                    });
                    if (foundIndex !== -1) {
                        // Filtered tweets are removed from diffTweets for efficiency only
                        var removedTweet = diffTweets.splice(foundIndex, 1)[0];
                        // Filtered tweets are added to the diff list
                        columnDiffList[columnIdx].removed.push(removedTweet);
                        return false;
                    }
                    return true;
                });
            });
            // Add tweets to the columnList
            tweets.forEach(function(tweet) {
                // Find the index of the first column that matches the tweet
                var columnIndex = columnDataList.findIndex(function(columnData) {
                    return columnData.selector(tweet);
                });
                if (columnIndex !== -1) {
                    columnList[columnIndex].push(tweet);
                    columnDiffList[columnIndex].added.push(tweet);
                }
            });
            return {
                columnList: columnList,
                diffList: columnDiffList,
            };
        }

        function sortColumns(columnList, columnDataList) {
            var sortedColumns = columnList.map(function(column, idx) {
                return sortColumn(column, columnDataList[idx]);
            });
            return sortedColumns;
        }

        function resortColumns(columnDiffList, columnDataList, storeName) {
            return columnDiffList.map(function(columnDiff, columnIdx) {
                var sortedColumn = [];

                // Tweets to filter from the stored column
                var removedTweets = columnDiff.removed.slice();

                // New tweets are sorted according to the column's sort, in order to make their insertion efficient
                var sortedAddedTweets = sortColumn(columnDiff.added, columnDataList[columnIdx]);

                // Copy contents of the stored column into the new column, filtering out tweets in
                // removedTweets and inserting tweets in sortedAddedTweets into the correct sorted position
                store[storeName].assignedColumns[columnIdx].forEach(function(tweet) {
                    // Move all the tweets from sortedAddedTweets that fit the current position into the new column
                    while (
                        sortedAddedTweets.length > 0 &&
                        columnDataList[columnIdx].ordering(sortedAddedTweets[0], tweet) < 0
                    ) {
                        sortedColumn.push(sortedAddedTweets.shift());
                    }
                    // Don't insert a tweet if it exists in removedTweets
                    var foundRemovedIndex = removedTweets.findIndex(function(searchTweet) {
                        return searchTweet.id_str === tweet.id_str;
                    });
                    if (foundRemovedIndex !== -1) {
                        // Remove already filtered tweets from removedTweets for efficiency only
                        removedTweets.splice(foundRemovedIndex, 1);
                    } else {
                        // Add the current tweet to the new column
                        sortedColumn.push(tweet);
                    }
                });
                return sortedColumn;
            });
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
