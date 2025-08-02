import { Sounds } from "./sfx";
import { getRelativeTime } from "./time";

export class Timer {
	private timer: HTMLElement;
	private startTime = 0;
	static #instance: Timer | undefined;
	private loop = false;
	private updateTimer: number = 0;
	private lastRunTime = 0;
	private interval = 1000;

	constructor(newTimer: HTMLElement) {
		this.timer = newTimer;
		Timer.#instance ??= this;
	}

	static getInstance(): Timer | undefined {
		return Timer.#instance;
	}

	setTimer(time: number, loopHandler?: (time: number) => void) {
		this.lastRunTime = this.startTime = Date.now();

		const setCounter = (time: string) => {
			if (this.timer == undefined) return;
			this.timer.textContent = time;
		};
		this.stopTimer();

		const timerLoopFunction = (loopHandler?: (time: number) => void) => {
			const remainingTime = Math.max(
				0,
				Math.round((this.startTime - Date.now()) / 1000 + time)
			);
			if (remainingTime <= 0) {
				this.stopTimer();
			}
			const formattedTime = secsToMins(remainingTime);
			setCounter(formattedTime);

			const startMs = this.startTime % this.interval;
			const currentMs = Date.now() % this.interval;
			const delay =
				startMs > currentMs
					? startMs - currentMs
					: this.interval + startMs - currentMs;
			if (this.loop) timerLoop(Math.max(0, delay));

			this.lastRunTime = Date.now();

			if (loopHandler) {
				loopHandler(remainingTime);
			}
		};

		const timerLoop = (interval?: number) => {
			interval ??= this.interval;
			this.updateTimer = setTimeout(
				() => timerLoopFunction(loopHandler),
				interval
			);
		};

		timerLoop();
		timerLoopFunction(loopHandler);
		this.loop = true;
	}

	stopTimer() {
		clearTimeout(this.updateTimer);
		this.loop = false;
	}

	getStartTime(): number {
		return this.startTime;
	}
}

let updateStopwatch: number;
export function setupStopwatch(element: HTMLElement, time: number) {
	clearInterval(updateStopwatch);
	const startTime = Date.now();
	const setCounter = (time: string) => {
		element.innerHTML = time;
	};
	updateStopwatch = setInterval(() => {
		const currentTime =
			Math.round(time * 1e3 + Date.now() - startTime) / 1000;
		if (currentTime >= 9999) {
			clearInterval(updateStopwatch);
		}
		setCounter(`${currentTime}`);
	}, 1); // update about every second
	setCounter(time.toFixed(3));
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

let sounds: Sounds;
export function registerSounds(newSounds: Sounds) {
	sounds = newSounds;
}

/*
	FTC specific timer functions
*/

// Store relative times based on estimated RC clock
const relativePeriodTimes = {
	AUTO: 0,
	TRANSITION: 0,
	TELEOP: 0,
};

export function getRelativePeriodTimes() {
	return relativePeriodTimes;
}

const autoTimerLoop = (time: number) => {
	if (time <= 120) {
		sounds?.playSound("autoend");
		setTransitionTimer();
	}
};

export function setAutoTimer(startingTime?: number) {
	startingTime ??= 30;
	const timerInstance = Timer.getInstance();
	if (timerInstance) {
		timerInstance.setTimer(120 + startingTime, autoTimerLoop);
	}
	relativePeriodTimes.AUTO = getRelativeTime();
}

const transitionTimerLoop = (time: number) => {
	switch (time) {
		case 6:
			sounds?.playSound("pickupcontrollers");
			break;
		case 3:
			sounds?.playSound("countdown");
			break;
		case 0:
			sounds?.playSound("teleopbegin");
			setTeleopTimer();
			break;
	}
	if (time < 0) {
		Timer.getInstance()?.stopTimer();
	}
};

export function setTransitionTimer(startingTime?: number) {
	startingTime ??= 8;
	const timerInstance = Timer.getInstance();
	if (timerInstance) {
		timerInstance.setTimer(startingTime, transitionTimerLoop);
	}
	relativePeriodTimes.TRANSITION = getRelativeTime();
}

const teleopTimerLoop = (time: number) => {
	switch (time) {
		case 30:
			sounds?.playSound("endgame");
			break;
		case 0:
			sounds?.playSound("endmatch");
			break;
	}
	if (time <= 0) {
		Timer.getInstance()?.stopTimer();
	}
};

export function setTeleopTimer(startingTime?: number) {
	startingTime ??= 120;
	const timerInstance = Timer.getInstance();
	if (timerInstance) {
		timerInstance.setTimer(startingTime, teleopTimerLoop);
	}
	relativePeriodTimes.TELEOP = getRelativeTime();
}
