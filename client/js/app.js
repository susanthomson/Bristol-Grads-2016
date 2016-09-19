require('angular-moment');
(function() {
    var app = angular.module("TwitterWallApp", ['angularMoment']);
    app.constant('moment', require('moment-timezone'));
})();

