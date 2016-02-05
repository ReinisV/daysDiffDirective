# daysDiffDirective
an angular directive, which displays (as a string) the difference between any two javascript Date objects, or one Date object and this moment.

This is just a quick directive I wrote. It is far from perfect and comes as-is. Use it as you see fit. (within the constraints of MIT license).

If you found a bug, or thought of something interesting to add, use the [Issues tab](https://github.com/ReinisV/daysDiffDirective/issues) or create a [Pull request](https://github.com/ReinisV/daysDiffDirective/pulls).

**[demo plnkr here](http://plnkr.co/edit/48RlH85hEEEgPLYWsNED?p=preview)**

**TODO:**

[bug] if dd-translation object gets instantiated and then set to null, days-diff does not reset translation values to defaults, but keeps it's previous value

[feature] make diff-days take into account the calendar when calculating diff. Right now it assumes that a day is 24 x hour, a week is 7 x day, a month is 4 x week, and year is 12 x month, this does not take into account stuff like daylight savings and different lengths of month.

[feature] maybe implement the usage of [ng-pluralize](https://docs.angularjs.org/api/ng/directive/ngPluralize)?



