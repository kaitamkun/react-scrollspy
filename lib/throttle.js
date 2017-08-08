"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = throttle;
function throttle(fn) {
	var threshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;

	var last = void 0,
	    timer = void 0;

	return function () {
		var now = new Date().getTime();

		if (last && now < last + threshold) {
			clearTimeout(timer);

			timer = setTimeout(function () {
				last = now;
				fn();
			}, threshold);
		} else {
			last = now;
			fn();
		}
	};
}