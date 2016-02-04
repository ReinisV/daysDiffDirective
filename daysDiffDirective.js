
(function () {
    // good coding practices
    "use strict";

    // global constants
    var milliSecsInSec = 1000;
    var milliSecsInMin = 60 * milliSecsInSec;
    var milliSecsInHour = 60 * milliSecsInMin;
    var milliSecsInDay = 24 * milliSecsInHour;
    var milliSecsInWeek = 7 * milliSecsInDay;
    var milliSecsInMonth = 4 * milliSecsInWeek;
    var milliSecsInYear = 12 * milliSecsInMonth;


    var dateDiff = function (dateFrom, dateTo) {

        var delta = Math.abs(dateTo.getTime() - dateFrom.getTime());

        var years = Math.floor(delta / milliSecsInYear);
        delta -= years * milliSecsInYear;

        var months = Math.floor(delta / milliSecsInMonth);
        delta -= months * milliSecsInMonth;

        var weeks = Math.floor(delta / milliSecsInWeek);
        delta -= weeks * milliSecsInWeek;

        var days = Math.floor(delta / milliSecsInDay);
        delta -= days * milliSecsInDay;

        var hours = Math.floor(delta / milliSecsInHour);
        delta -= hours * milliSecsInHour;

        var minutes = Math.floor(delta / milliSecsInMin);
        delta -= minutes * milliSecsInMin;

        var seconds = Math.floor(delta / milliSecsInSec);

        return [
            { key: "years", value: years, timeInMilli: milliSecsInYear },
            { key: "months", value: months, timeInMilli: milliSecsInMonth },
            { key: "weeks", value: weeks, timeInMilli: milliSecsInWeek },
            { key: "days", value: days, timeInMilli: milliSecsInDay },
            { key: "hours", value: hours, timeInMilli: milliSecsInHour },
            { key: "minutes", value: minutes, timeInMilli: milliSecsInMin },
            { key: "seconds", value: seconds, timeInMilli: milliSecsInSec }
        ];
    };
    var html =
    "<div>" +
    "<span ng-repeat=\"unit in dateUnits\">" +
"<span ng-if=\"unit.value\">" +
    "<span ng-bind=\"unit.value + ' '\"></span>" +
    "<span ng-switch=\"unit.key\">" +
        "<span ng-switch-when=\"years\" ng-bind=\"unit.value === 1 ? innerTrans.year : innerTrans.years\"></span>" +
        "<span ng-switch-when=\"months\" ng-bind=\"unit.value === 1 ? innerTrans.month : innerTrans.months\"></span>" +
        "<span ng-switch-when=\"weeks\" ng-bind=\"unit.value === 1 ? innerTrans.week : innerTrans.weeks\"></span>" +
        "<span ng-switch-when=\"days\"> <span ng-bind=\"unit.value === 1 ? innerTrans.day : innerTrans.days\"></span></span>" +
        "<span ng-switch-when=\"hours\" ng-bind=\"unit.value === 1 ? innerTrans.hour : innerTrans.hours\"></span>" +
        "<span ng-switch-when=\"minutes\" ng-bind=\"unit.value === 1 ? innerTrans.minute : innerTrans.minutes\"></span>" +
        "<span ng-switch-when=\"seconds\" ng-bind=\"unit.value === 1 ? innerTrans.second : innerTrans.seconds\"></span>" +
        "<span ng-switch-default></span>" +
    "</span>" +
    "<span ng-if=\"!$last && !((dateUnits.length - $index) === 2)\" ng-bind=\"', '\"></span>" +
    "<span ng-if=\"(dateUnits.length - $index) === 2\" ng-bind=\"' ' + innerTrans.and + ' '\"></span>" +
"</span>" +
"<span ng-if=\"unit.key === 'moments'\" ng-bind=\"innerTrans.moments\"></span>" +
"</span>" +
"</div>";

    angular.module("daysDiffDirective", []).directive("daysDiff", [
        "$interval", "$timeout", function ($interval, $timeout) {

            return {
                restrict: "AE",
                replace: true,
                template: html,
                scope: {
                    ddFrom: "=",
                    ddTo: "=",
                    ddTranslation: "=",
                    ddAmountOfUnits: "="
                },
                compile: function compilingFunction($templateElement, $templateAttributes) {

                    $templateElement.replaceWith(this.template);

                    return function linkingFunction($scope, $element, $attrs) {

                        // set up 
                        var intervalObj;
                        var shouldUpdateLiveDate;

                        var trimDateSinceObj = function (dateSince, amountOfUnits) {
                            var trimmedSince = [];
                            for (var i = 0; i < dateSince.length; i++) {
                                if (amountOfUnits > 0 && dateSince[i].value > 0) {
                                    trimmedSince.push(dateSince[i]);
                                    amountOfUnits -= 1;
                                }
                            }
                            return trimmedSince;

                        };
                        var refreshUI = function () {
                            $scope.dateUnits = trimDateSinceObj(dateDiff($scope.innerDdFrom, $scope.innerDdTo), $scope.innerAmountOfUnits);
                            if ($scope.dateUnits.length === 0) {
                                $scope.dateUnits.push({ key: "moments", value: 0, timeInMilli: 0 });
                            }
                        };
                        var stop = function () {
                            $interval.cancel(intervalObj);
                            $scope.dateUnits = null;
                        }

                        // cleanup on element destroy event
                        $element.on("$destroy", function () {
                            stop();
                        });

                        $scope.$watch("ddFrom", function (newValues, oldValues) {
                            if (newValues) {
                                // cancel any previous interval objects, 
                                // since if there is an interval now,
                                // it is either for this property (and 
                                // thus will be reset) or it is for the
                                // other property (and thus will be 
                                // reinstantiated)
                                if (intervalObj) {
                                    $interval.cancel(intervalObj);
                                }
                                // check for date
                                if (angular.isDate(newValues)) {
                                    $scope.innerDdFrom = newValues;
                                } else {
                                    throw new Error("dd-from is not a date object", newValues);
                                }
                                if (!$scope.ddTo) {
                                    // since no ddTo is defined, assume user wants
                                    // to use today
                                    $scope.innerDdTo = new Date();
                                    shouldUpdateLiveDate = true;
                                }
                            } else {
                                // if ddTo is set to undefined, but there is ddFrom
                                if ($scope.ddTo) {
                                    // since no ddTo is defined, assume user wants
                                    // to use today
                                    $scope.innerDdFrom = new Date();
                                    shouldUpdateLiveDate = true;
                                } else {
                                    stop();
                                    throw new Error("days-diff element needs dd-from and/or dd-to on the same element");
                                }
                            }
                        }, true);

                        $scope.$watch("ddTo", function (newValues, oldValues) {
                            if (newValues) {
                                // cancel any previous interval objects, 
                                // since if there is an interval now,
                                // it is either for this property (and 
                                // thus will be reset) or it is for the
                                // other property (and thus will be 
                                // reinstantiated)
                                if (intervalObj) {
                                    $interval.cancel(intervalObj);
                                }
                                // check for date
                                if (angular.isDate(newValues)) {
                                    $scope.innerDdTo = newValues;
                                } else {
                                    stop();
                                    throw new Error("dd-from is not a date object " + newValues);
                                }
                                if (!$scope.ddFrom) {
                                    // since no ddFrom is defined, assume user wants
                                    // to use today
                                    $scope.innerDdFrom = new Date();
                                    shouldUpdateLiveDate = true;
                                }
                            } else {

                                // if ddTo is set to undefined, but there is ddFrom
                                if ($scope.ddFrom) {

                                    // since no ddTo is defined, assume user wants
                                    // to use today
                                    $scope.innerDdTo = new Date();
                                    shouldUpdateLiveDate = true;

                                } else {
                                    stop();
                                    throw new Error("days-diff element needs dd-from and/or dd-to on the same element");
                                }
                            }
                        }, true);

                        $scope.$watch("ddAmountOfUnits", function (newValues, oldValues) {
                            if (newValues) {
                                if (angular.isNumber($scope.ddAmountOfUnits)) {
                                    $scope.innerAmountOfUnits = $scope.ddAmountOfUnits;
                                    shouldUpdateLiveDate = true;
                                } else {
                                    var int = parseInt($scope.ddAmountOfUnits);
                                    if (!isNaN(int)) {
                                        if (int > 7) {
                                            stop();
                                            throw new Error("amount of units should not be bigger than 7 (1:yrs,2:mths,3:wks,4:dys,5:hrs,6:mins,7:secs), you set it to " + int);
                                        } else if (int < 0) {
                                            stop();
                                            throw new Error("amount of units should not be smaller than 7 (1:yrs,2:mths,3:wks,4:dys,5:hrs,6:mins,7:secs), you set it to " + int);
                                        } else {
                                            $scope.innerAmountOfUnits = int;
                                            shouldUpdateLiveDate = true;
                                        }
                                    } else {
                                        stop();
                                        throw new Error("your ddAmountOfUnits is not a number: " + $scope.ddAmountOfUnits + " (parsed: " + int + ")");
                                    }
                                }
                            } else {
                                $scope.innerAmountOfUnits = 3; // default value
                                shouldUpdateLiveDate = true;
                            }

                        }, true);

                        $scope.$watch("ddTranslation", function (newValues, oldValues) {
                            var translation = angular.copy(newValues);
                            // if there are no values, use default
                            if (!translation.and) { translation.and = "and" }
                            if (!translation.year) { translation.year = "year" }
                            if (!translation.years) { translation.years = "years" }
                            if (!translation.month) { translation.month = "month" }
                            if (!translation.months) { translation.months = "months" }
                            if (!translation.week) { translation.week = "week" }
                            if (!translation.weeks) { translation.weeks = "weeks" }
                            if (!translation.day) { translation.day = "day" }
                            if (!translation.days) { translation.days = "days" }
                            if (!translation.hour) { translation.hour = "hour" }
                            if (!translation.hours) { translation.hours = "hours" }
                            if (!translation.minute) { translation.minute = "minute" }
                            if (!translation.minutes) { translation.minutes = "minutes" }
                            if (!translation.second) { translation.second = "second" }
                            if (!translation.seconds) { translation.seconds = "seconds" }
                            if (!translation.moments) { translation.moments = "moments" }
                            $scope.innerTrans = translation;

                        }, true);
                        var startLiveDate = function () {
                            if (!$scope.ddTo || !$scope.ddFrom) {
                                if (intervalObj) {
                                    $interval.cancel(intervalObj);
                                }
                                var trimmedDateSince = trimDateSinceObj(dateDiff($scope.innerDdFrom, $scope.innerDdTo), $scope.innerAmountOfUnits);
                                var lastSignificantDateSince = trimmedDateSince[trimmedDateSince.length - 1];
                                if (!lastSignificantDateSince) {
                                    // diff between this moment and user defined moment is too small, so
                                    // sleep for one second, redefine this moment and try again
                                    $timeout(function () {
                                        if (!$scope.ddTo) {
                                            $scope.innerDdTo = new Date();

                                        } else if (!$scope.ddFrom) {
                                            $scope.innerDdFrom = new Date();
                                        }
                                        startLiveDate();
                                    }, 1000);
                                    return;
                                }
                                if (!$scope.ddTo && !$scope.ddFrom) {
                                    stop();
                                    throw new Error("days-diff element needs dd-from and/or dd-to on the same element");
                                }
                                else if (!$scope.ddTo) {
                                    // shoot an interval, which will refresh it every 
                                    // time the smallest shown element changes
                                    intervalObj = $interval(function () {
                                        $scope.innerDdTo = new Date();
                                    }, lastSignificantDateSince.timeInMilli);
                                } else if (!$scope.ddFrom) {
                                    // shoot an interval, which will refresh it every 
                                    // time the smallest shown element changes
                                    intervalObj = $interval(function () {
                                        $scope.innerDdFrom = new Date();
                                    }, lastSignificantDateSince.timeInMilli);
                                }
                            }
                        }

                        $scope.$watchGroup(["innerDdFrom", "innerDdTo", "innerAmountOfUnits", "innerTrans"], function (newValues, oldValues, scope) {
                            if (newValues[0] && newValues[1] && newValues[2] && newValues[3]) {
                                // do refresh when any of the inner properties are changed
                                refreshUI();
                                if (shouldUpdateLiveDate) {
                                    startLiveDate();
                                    shouldUpdateLiveDate = false;
                                }
                            }
                        }, true);

                    };
                }
            };



        }
    ]);


}
	)();
