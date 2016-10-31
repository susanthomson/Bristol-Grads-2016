(function() {
    angular.module("TwitterWallApp").directive("expandingText", expandingText);

    expandingText.$inject = ["$interval"];

    function expandingText($interval) {
        return {
            restrict: "A",
            scope: {
            },
            link: function(scope, element, attrs) {
                var maxHeight;
                var fontSize = 6;
                var transitionTime = 1500;
                var transitionInterval = 100;
                var elapsedTime = 0;
                var padding = Number(element.css("padding-left").replace("px","")) + Number(element.css("padding-right").replace("px",""));
                element.css("font-size", fontSize + "px");
                var heightTimer = $interval(function() {
                    elapsedTime += transitionInterval;
                    if(elapsedTime >= transitionTime) {
                        $interval.cancel(heightTimer);
                    };
                    fontSize = fontSize + 4;
                    var card = element.parent().parent();
                    var cardHeight = card.height();
                    var contentWidth = element.parent().innerWidth();
                    var imageWidth = element.next().outerWidth() || 0;
                    if (cardHeight > 70) {
                        maxHeight = Math.max(cardHeight - 100, 10 + cardHeight * 0.2);
                        var maxWidth = contentWidth - imageWidth - padding;
                        element.css("max-width", maxWidth);
                        element.css("font-size", fontSize + "px");
                        while(element.height() > maxHeight || element[0].scrollWidth > maxWidth) {
                            fontSize -= 2;
                            element.css("font-size", fontSize + "px");
                        }
                    }
                }, transitionInterval);
                element.on("$destroy", function() {
                    $interval.cancel(heightTimer);
                });
            },
        };
    }
})();

