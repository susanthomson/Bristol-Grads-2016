angular.module("TwitterWallApp").directive("unlimited", function() {
    return {
        restrict: "EA",
        scope: {
            n: "@"
        },
        template: "<div>{{n}}</div>",
        link: function(scope) {
            console.log("unlimited: " + scope.n + " loaded");
        }
    };
});
