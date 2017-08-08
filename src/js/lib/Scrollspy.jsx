//@flow
import React from "react";
import classNames from "classnames";
import throttle from "./throttle";

type ViewStateType = {|
	inView: HTMLElement[],
	outView: HTMLElement[],
	viewStatusList: boolean[],
	scrolledPast: boolean[]
|};

type ScrollDimensionType = {|
	scrollTop: number,
	scrollHeight: number
|};

export default class Scrollspy extends React.Component {
	_throttled: () => void;

	props: {
		items: string[],
		currentClassName: string,
		scrolledPastClassName: string,
		style?: { [name: string]: string },
		componentTag: string,
		offset: number,
		rootElement?: string,
		className: string,
		children?: *,
		onChange?: (number, number) => void
	};

	static defaultProps = {
		items: [],
		currentClassName: "",
		style: {},
		componentTag: "ul",
		offset: 0,
		className: ""
	};

	state = {
		targetItems: [],
		inViewState: [],
		isScrolledPast: [],
		lastVisibleIndex: 0
	};

	constructor(props: *) {
		super(props);

		this._throttled = throttle(() => this._spy(this.state.targetItems), 100);
	}

	_initSpyTarget(ids: string[]): HTMLElement[] {
		// Flow doesn't seem to understand that the .filter() call removes all possible null values.
		//$FlowIgnore
		return ids.map((item) => document.getElementById(item)).filter((element) => element);
	}

	// https://github.com/makotot/react-scrollspy/pull/45
	_fillArray<T>(array: T[], val: T): T[] {
		const newArray = [];

		for (let i = 0, max = array.length; i < max; i++) {
			newArray[i] = val;
		}

		return newArray;
	}

	_isScrolled(): boolean {
		return 0 < this._getScrollDimension().scrollTop;
	}

	_getScrollDimension(): ScrollDimensionType {
		const {rootElement} = this.props;

		if (rootElement) {
			const queried = document.querySelector(rootElement);

			if (queried) {
				const {scrollTop, scrollHeight} = queried;
				return {scrollTop, scrollHeight};
			}

			return {scrollTop: 0, scrollHeight: 0};
		}

		if (document.documentElement) {
			const {scrollTop, scrollHeight} = document.documentElement;
			return {scrollTop, scrollHeight};
		}

		if (document.body && document.body.parentNode) {
			const {scrollTop, scrollHeight} = (document.body.parentNode: any);
			return {scrollTop, scrollHeight};
		}

		if (document.body) {
			const {scrollTop, scrollHeight} = document.body;
			return {scrollTop, scrollHeight};
		}

		return {scrollTop: 0, scrollHeight: 0};
	}

	_getElemsViewState(targets: HTMLElement[]): ViewStateType {
		let elemsInView = [];
		let elemsOutView = [];
		let viewStatusList = [];

		const targetItems = targets || this.state.targetItems;

		let hasInViewAlready = false;

		for (let i = 0, max = targetItems.length; i < max; i++) {
			let currentContent = targetItems[i];
			let isInView = hasInViewAlready? false : this._isInView(currentContent);

			if (isInView) {
				hasInViewAlready = true;
				elemsInView.push(currentContent);
			} else {
				elemsOutView.push(currentContent);
			}

			const isLastItem = i === max - 1;
			const isScrolled = this._isScrolled();

			// https://github.com/makotot/react-scrollspy/pull/26#issue-167413769
			const isLastShortItemAtBottom = this._isAtBottom() && this._isInView(currentContent) && !isInView && isLastItem && isScrolled;

			if (isLastShortItemAtBottom) {
				elemsOutView.pop();
				elemsOutView.push(...elemsInView);
				elemsInView = [currentContent];
				viewStatusList = this._fillArray(viewStatusList, false);
				isInView = true;
			}

			const index = viewStatusList.length;
			if (isInView && index != this.state.lastVisibleIndex) {
				this._itemChanged(index, this.state.lastVisibleIndex);
			}

			viewStatusList.push(isInView);
		}

		return {
			inView: elemsInView,
			outView: elemsOutView,
			viewStatusList,
			scrolledPast: this.props.scrolledPastClassName? this._getScrolledPast(viewStatusList) : []
		};
	}

	_itemChanged(newIndex: number, oldIndex: number) {
		if (this.props.onChange) {
			this.props.onChange(newIndex, oldIndex);
		}

		this.setState({lastVisibleIndex: newIndex});
	}

	_isInView(element: HTMLElement): boolean {
		if (!element) {
			return false;
		}

		const {rootElement, offset} = this.props;
		const {scrollTop} = this._getScrollDimension();

		let windowHeight = window.innerHeight;
		let elementTop = scrollTop + offset + element.getBoundingClientRect().top;

		if (rootElement) {
			const queried = document.querySelector(rootElement);
			if (queried) {
				const rootRect = queried.getBoundingClientRect();
				windowHeight = rootRect.height;
				elementTop -= rootRect.top;
			}
		}

		const scrollBottom = scrollTop + windowHeight;
		const elementBottom = elementTop + element.offsetHeight;

		return elementTop < scrollBottom && scrollTop < elementBottom;
	}

	_isAtBottom(): boolean {
		const {scrollTop, scrollHeight} = this._getScrollDimension();

		let windowHeight = window.innerHeight;
		if (this.props.rootElement) {
			const queried = document.querySelector(this.props.rootElement);
			if (queried) {
				windowHeight = queried.getBoundingClientRect().height;
			}
		}

		return scrollHeight <= scrollTop + windowHeight;
	}

	_getScrolledPast(viewStatusList: boolean[]): boolean[] {
		if (!viewStatusList.some((item) => item)) {
			return viewStatusList;
		}

		let hasFoundInView = false;

		return viewStatusList.map((item) => {
			if (item && !hasFoundInView) {
				hasFoundInView = true;
			}

			return !hasFoundInView;
		});
	}

	_spy(targets: HTMLElement[]) {
		const {viewStatusList, scrolledPast} = this._getElemsViewState(targets);

		this.setState({
			inViewState: viewStatusList,
			isScrolledPast: scrolledPast
		});
	}

	_initFromProps() {
		const targetItems = this._initSpyTarget(this.props.items);

		this.setState({targetItems});
		this._spy(targetItems);
	}

	offEvent() {
		const element = this.props.rootElement? document.querySelector(this.props.rootElement) : window;

		if (element) {
			element.removeEventListener("scroll", this._throttled);
		}
	}

	onEvent() {
		const element = this.props.rootElement? document.querySelector(this.props.rootElement) : window;

		if (element) {
			element.addEventListener("scroll", this._throttled);
		}
	}

	componentDidMount() {
		this._initFromProps();
		this.onEvent();
	}

	componentWillUnmount() {
		this.offEvent();
	}

	componentWillReceiveProps() {
		this._initFromProps();
	}

	render(): React$Element<*> {
		const Tag = this.props.componentTag;
		const {
			children,
			className,
			scrolledPastClassName,
			style,
		} = this.props;
		let counter = 0;
		const items = React.Children.map(children, (child, idx) => {
			if (!child) {
				return null;
			}

			const ChildTag = child.type;
			const isScrolledPast = scrolledPastClassName && this.state.isScrolledPast[idx];
			const childClass = classNames({
				[`${child.props.className}`]: child.props.className,
				[`${this.props.currentClassName}`]: this.state.inViewState[idx],
				[`${this.props.scrolledPastClassName}`]: isScrolledPast,
			});

			return <ChildTag {...child.props} className={childClass} key={counter++}>
				{child.props.children}
			</ChildTag>;
		});

		const itemClass = classNames({
			[`${className}`]: className,
		});

		return <Tag className={itemClass} style={style}>
			{items}
		</Tag>;
	}
}
