angular.module("TwitterWallApp").directive("foo", function() {
    return {
        restrict: "EA",
        scope: {
            n: "@"
        },
        template: "<div>{{n}}</div>",
        link: function(scope) {
            console.log("foo: " + scope.n + " loaded");
        }
    };
});
