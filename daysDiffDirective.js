
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
                        };
                        // cleanup on element destroy event
                        $element.on("$destroy", function () {

                            $interval.cancel(intervalObj);
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
                                if (angular.isDate($scope.ddFrom)) {
                                    $scope.innerDdFrom = $scope.ddFrom;
                                } else {
                                    throw "dd-from is not a date object" + $scope.ddFrom;
                                }
                                if (!$scope.ddTo) {
                                    // since no ddTo is defined, assume user wants
                                    // to use today
                                    $scope.innerDdTo = new Date();
                                    shouldUpdateLiveDate = true;
                                }
                            }
                        });

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
                                if (angular.isDate($scope.ddTo)) {
                                    $scope.innerDdTo = $scope.ddTo;
                                } else {
                                    throw "dd-from is not a date object " + $scope.ddTo;
                                }
                                if (!$scope.ddFrom) {
                                    // since no ddFrom is defined, assume user wants
                                    // to use today
                                    $scope.innerDdFrom = new Date();
                                    shouldUpdateLiveDate = true;
                                }
                            }
                        });

                        $scope.$watch("ddAmountOfUnits", function (newValues, oldValues) {
                            if (newValues) {
                                if (angular.isNumber($scope.ddAmountOfUnits)) {
                                    $scope.innerAmountOfUnits = $scope.ddAmountOfUnits;
                                }
                                else {
                                    var int = parseInt($scope.ddAmountOfUnits);
                                    if (!isNaN(int)) {
                                        if (int > 7) {
                                            throw "amount of units should not be bigger than 7 (1:yrs,2:mths,3:wks,4:dys,5:hrs,6:mins,7:secs), you set it to " + int;
                                        } else if (int < 0) {
                                            throw "amount of units should not be smaller than 7 (1:yrs,2:mths,3:wks,4:dys,5:hrs,6:mins,7:secs), you set it to " + int;
                                        } else {
                                            $scope.innerAmountOfUnits = int;
                                        }
                                    } else {
                                        throw "your ddAmountOfUnits is not a number: " + $scope.ddAmountOfUnits + " (parsed: " + int + ")";
                                    }
                                }
                            }

                        });

                        $scope.$watch("ddTranslation", function (newValues, oldValues) {
                            if (newValues) {
                                // if there are no values, use default
                                if (!newValues.ago) { newValues.ago = "ago" }
                                if (!newValues.after) { newValues.after = "after" }
                                if (!newValues.and) { newValues.and = "and" }
                                if (!newValues.year) { newValues.year = "year" }
                                if (!newValues.years) { newValues.years = "years" }
                                if (!newValues.month) { newValues.month = "month" }
                                if (!newValues.months) { newValues.months = "months" }
                                if (!newValues.week) { newValues.week = "week" }
                                if (!newValues.weeks) { newValues.weeks = "weeks" }
                                if (!newValues.day) { newValues.day = "day" }
                                if (!newValues.days) { newValues.days = "days" }
                                if (!newValues.hour) { newValues.hour = "hour" }
                                if (!newValues.hours) { newValues.hours = "hours" }
                                if (!newValues.minute) { newValues.minute = "minute" }
                                if (!newValues.minutes) { newValues.minutes = "minutes" }
                                if (!newValues.second) { newValues.second = "second" }
                                if (!newValues.seconds) { newValues.seconds = "seconds" }
                                if (!newValues.moments) { newValues.moments = "moments" }
                                $scope.innerTrans = newValues;
                            }
                        });
                        var startLiveDate = function () {
                            if (!$scope.ddTo || !$scope.ddFrom) {
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
                                if (!$scope.ddTo) {
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
                                } // this will never be triggered
                                else {
                                    throw "days-diff element needs dd-from and/or dd-to on the same element";
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
                        });

                    };
                }
            };



        }
    ]);


}
	)();
