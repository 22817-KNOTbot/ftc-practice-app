export function setScore(element: HTMLElement, score: number, type?: string) {
	type = type != undefined ? type : "Score";
	const oldScore = parseInt(element.textContent || "0");
	element.textContent = `${Math.floor(score)}`;
	// TODO: Display type in cycle changes box
	if (type != type || oldScore != oldScore) return;
}
