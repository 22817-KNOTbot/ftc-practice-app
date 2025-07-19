let updateTimer: number;
export function setTimer(
	element: HTMLElement,
	time: number,
	loop?: (time: number) => void
) {
	const startTime = Date.now();
	const setCounter = (time: string) => {
		element.innerHTML = time;
	};
	clearInterval(updateTimer);
	updateTimer = setInterval(() => {
		const remainingTime = Math.max(
			0,
			Math.round((startTime - Date.now()) / 1000) + time
		);
		if (remainingTime <= 0) {
			clearInterval(updateTimer);
		}
		const formattedTime = secsToMins(remainingTime);
		setCounter(formattedTime);
		if (loop) {
			loop(remainingTime);
		}
	}, 1000); // update about every second
	setCounter(`${secsToMins(time)}`);
}

export function stopTimer() {
	clearInterval(updateTimer);
}

let updateStopwatch: number;
export function setupStopwatch(element: HTMLElement, time: number) {
	const startTime = Date.now();
	const setCounter = (time: string) => {
		element.innerHTML = time;
	};
	updateStopwatch = setInterval(() => {
		const currentTime = +((Date.now() - startTime) / 1000).toFixed(3);
		if (currentTime >= 9999) {
			clearInterval(updateStopwatch);
		}
		setCounter(`${currentTime}`);
	}, 1); // update about every second
	setCounter(`${time.toFixed(3)}`);
}

export function resetStopwatch(element: HTMLElement) {
	clearInterval(updateStopwatch);
	setupStopwatch(element, 0);
}

export function stopStopwatch() {
	clearInterval(updateStopwatch);
}

function secsToMins(s: number) {
	return (s - (s %= 60)) / 60 + (9 < s ? ":" : ":0") + s;
}
