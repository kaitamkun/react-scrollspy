//@flow

export default function throttle(fn: () => void, threshold: number = 100): () => void {
	let last: number,
		timer: number;

	return () => {
		const now: number = new Date().getTime();

		if (last && (now < last + threshold)) {
			clearTimeout(timer);

			timer = setTimeout(() => {
				last = now;
				fn();
			}, threshold);
		} else {
			last = now;
			fn();
		}
	};
}
