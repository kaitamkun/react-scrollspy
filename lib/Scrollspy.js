"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _classnames = require("classnames");

var _classnames2 = _interopRequireDefault(_classnames);

var _throttle = require("./throttle");

var _throttle2 = _interopRequireDefault(_throttle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scrollspy = function (_React$Component) {
	(0, _inherits3.default)(Scrollspy, _React$Component);

	function Scrollspy(props) {
		(0, _classCallCheck3.default)(this, Scrollspy);

		var _this = (0, _possibleConstructorReturn3.default)(this, (Scrollspy.__proto__ || (0, _getPrototypeOf2.default)(Scrollspy)).call(this, props));

		_this.state = {
			targetItems: [],
			inViewState: [],
			isScrolledPast: [],
			lastVisibleIndex: 0
		};

		_this._throttled = (0, _throttle2.default)(function () {
			return _this._spy(_this.state.targetItems);
		}, props.limit);
		return _this;
	}

	(0, _createClass3.default)(Scrollspy, [{
		key: "_initSpyTarget",
		value: function _initSpyTarget(ids) {
			// Flow doesn't seem to understand that the .filter() call removes all possible null values.
			//$FlowIgnore
			return ids.map(function (item) {
				return document.getElementById(item);
			}).filter(function (element) {
				return element;
			});
		}

		// https://github.com/makotot/react-scrollspy/pull/45

	}, {
		key: "_fillArray",
		value: function _fillArray(array, val) {
			var newArray = [];

			for (var i = 0, max = array.length; i < max; i++) {
				newArray[i] = val;
			}

			return newArray;
		}
	}, {
		key: "_isScrolled",
		value: function _isScrolled() {
			return 0 < this._getScrollDimension().scrollTop;
		}
	}, {
		key: "_getScrollDimension",
		value: function _getScrollDimension() {
			var rootElement = this.props.rootElement;


			if (rootElement) {
				var queried = document.querySelector(rootElement);

				if (queried) {
					var _scrollTop = queried.scrollTop,
					    _scrollHeight = queried.scrollHeight;

					return { scrollTop: _scrollTop, scrollHeight: _scrollHeight };
				}

				return { scrollTop: 0, scrollHeight: 0 };
			}

			if (document.documentElement) {
				var _document$documentEle = document.documentElement,
				    _scrollTop2 = _document$documentEle.scrollTop,
				    _scrollHeight2 = _document$documentEle.scrollHeight;

				return { scrollTop: _scrollTop2, scrollHeight: _scrollHeight2 };
			}

			if (document.body && document.body.parentNode) {
				var _ref = document.body.parentNode,
				    _scrollTop3 = _ref.scrollTop,
				    _scrollHeight3 = _ref.scrollHeight;

				return { scrollTop: _scrollTop3, scrollHeight: _scrollHeight3 };
			}

			if (document.body) {
				var _document$body = document.body,
				    _scrollTop4 = _document$body.scrollTop,
				    _scrollHeight4 = _document$body.scrollHeight;

				return { scrollTop: _scrollTop4, scrollHeight: _scrollHeight4 };
			}

			return { scrollTop: 0, scrollHeight: 0 };
		}
	}, {
		key: "_getElemsViewState",
		value: function _getElemsViewState(targets) {
			var elemsInView = [];
			var elemsOutView = [];
			var viewStatusList = [];

			var targetItems = targets || this.state.targetItems;

			var hasInViewAlready = false;

			for (var i = 0, max = targetItems.length; i < max; i++) {
				var currentContent = targetItems[i];
				var isInView = hasInViewAlready ? false : this._isInView(currentContent);

				if (isInView) {
					hasInViewAlready = true;
					elemsInView.push(currentContent);
				} else {
					elemsOutView.push(currentContent);
				}

				var isLastItem = i === max - 1;
				var isScrolled = this._isScrolled();

				// https://github.com/makotot/react-scrollspy/pull/26#issue-167413769
				var isLastShortItemAtBottom = this._isAtBottom() && this._isInView(currentContent) && !isInView && isLastItem && isScrolled;

				if (isLastShortItemAtBottom) {
					elemsOutView.pop();
					elemsOutView.push.apply(elemsOutView, (0, _toConsumableArray3.default)(elemsInView));
					elemsInView = [currentContent];
					viewStatusList = this._fillArray(viewStatusList, false);
					isInView = true;
				}

				var index = viewStatusList.length;
				if (isInView && index != this.state.lastVisibleIndex) {
					this._itemChanged(index, this.state.lastVisibleIndex);
				}

				viewStatusList.push(isInView);
			}

			return {
				inView: elemsInView,
				outView: elemsOutView,
				viewStatusList: viewStatusList,
				scrolledPast: this.props.scrolledPastClassName ? this._getScrolledPast(viewStatusList) : []
			};
		}
	}, {
		key: "_itemChanged",
		value: function _itemChanged(newIndex, oldIndex) {
			if (this.props.onChange) {
				this.props.onChange(newIndex, oldIndex);
			}

			this.setState({ lastVisibleIndex: newIndex });
		}
	}, {
		key: "_isInView",
		value: function _isInView(element) {
			if (!element) {
				return false;
			}

			var _props = this.props,
			    rootElement = _props.rootElement,
			    offset = _props.offset;

			var _getScrollDimension2 = this._getScrollDimension(),
			    scrollTop = _getScrollDimension2.scrollTop;

			var windowHeight = window.innerHeight;
			var elementTop = scrollTop + offset + element.getBoundingClientRect().top;

			if (rootElement) {
				var queried = document.querySelector(rootElement);
				if (queried) {
					var rootRect = queried.getBoundingClientRect();
					windowHeight = rootRect.height;
					elementTop -= rootRect.top;
				}
			}

			var scrollBottom = scrollTop + windowHeight;
			var elementBottom = elementTop + element.offsetHeight;

			return elementTop < scrollBottom && scrollTop < elementBottom;
		}
	}, {
		key: "_isAtBottom",
		value: function _isAtBottom() {
			var _getScrollDimension3 = this._getScrollDimension(),
			    scrollTop = _getScrollDimension3.scrollTop,
			    scrollHeight = _getScrollDimension3.scrollHeight;

			var windowHeight = window.innerHeight;
			if (this.props.rootElement) {
				var queried = document.querySelector(this.props.rootElement);
				if (queried) {
					windowHeight = queried.getBoundingClientRect().height;
				}
			}

			return scrollHeight <= scrollTop + windowHeight;
		}
	}, {
		key: "_getScrolledPast",
		value: function _getScrolledPast(viewStatusList) {
			if (!viewStatusList.some(function (item) {
				return item;
			})) {
				return viewStatusList;
			}

			var hasFoundInView = false;

			return viewStatusList.map(function (item) {
				if (item && !hasFoundInView) {
					hasFoundInView = true;
				}

				return !hasFoundInView;
			});
		}
	}, {
		key: "_spy",
		value: function _spy(targets) {
			var _getElemsViewState2 = this._getElemsViewState(targets),
			    viewStatusList = _getElemsViewState2.viewStatusList,
			    scrolledPast = _getElemsViewState2.scrolledPast;

			this.setState({
				inViewState: viewStatusList,
				isScrolledPast: scrolledPast
			});
		}
	}, {
		key: "_initFromProps",
		value: function _initFromProps() {
			var targetItems = this._initSpyTarget(this.props.items);

			this.setState({ targetItems: targetItems });
			this._spy(targetItems);
		}
	}, {
		key: "offEvent",
		value: function offEvent() {
			var element = this.props.rootElement ? document.querySelector(this.props.rootElement) : window;

			if (element) {
				element.removeEventListener("scroll", this._throttled);
			}
		}
	}, {
		key: "onEvent",
		value: function onEvent() {
			var element = this.props.rootElement ? document.querySelector(this.props.rootElement) : window;

			if (element) {
				element.addEventListener("scroll", this._throttled);
			}
		}
	}, {
		key: "componentDidMount",
		value: function componentDidMount() {
			this._initFromProps();
			this.onEvent();
		}
	}, {
		key: "componentWillUnmount",
		value: function componentWillUnmount() {
			this.offEvent();
		}
	}, {
		key: "componentWillReceiveProps",
		value: function componentWillReceiveProps() {
			this._initFromProps();
		}
	}, {
		key: "render",
		value: function render() {
			var _this2 = this;

			var Tag = this.props.componentTag;
			var _props2 = this.props,
			    children = _props2.children,
			    className = _props2.className,
			    scrolledPastClassName = _props2.scrolledPastClassName,
			    style = _props2.style;

			var counter = 0;
			var items = _react2.default.Children.map(children, function (child, idx) {
				var _classNames;

				if (!child) {
					return null;
				}

				var ChildTag = child.type;
				var isScrolledPast = scrolledPastClassName && _this2.state.isScrolledPast[idx];
				var childClass = (0, _classnames2.default)((_classNames = {}, (0, _defineProperty3.default)(_classNames, "" + child.props.className, child.props.className), (0, _defineProperty3.default)(_classNames, "" + _this2.props.currentClassName, _this2.state.inViewState[idx]), (0, _defineProperty3.default)(_classNames, "" + _this2.props.scrolledPastClassName, isScrolledPast), _classNames));

				return _react2.default.createElement(
					ChildTag,
					(0, _extends3.default)({}, child.props, { className: childClass, key: counter++ }),
					child.props.children
				);
			});

			var itemClass = (0, _classnames2.default)((0, _defineProperty3.default)({}, "" + className, className));

			return _react2.default.createElement(
				Tag,
				{ className: itemClass, style: style },
				items
			);
		}
	}]);
	return Scrollspy;
}(_react2.default.Component);

Scrollspy.defaultProps = {
	items: [],
	currentClassName: "",
	style: {},
	componentTag: "ul",
	offset: 0,
	className: "",
	limit: 100
};
exports.default = Scrollspy;