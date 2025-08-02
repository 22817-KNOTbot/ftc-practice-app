let timeOffset: number = 0;

export function setTime(newTime: number) {
	timeOffset = Date.now() - newTime;
}

export function getRelativeTime(time?: number): number {
	time ??= Date.now();
	return time + timeOffset;
}
