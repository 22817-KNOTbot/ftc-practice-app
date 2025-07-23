export function setScore(element: HTMLElement, score: number, type?: string) {
	type = type != undefined ? type : "Score";
	const oldScore = parseInt(element.textContent || "0");
	element.textContent = `${Math.floor(score)}`;
	displayChange(score - oldScore, type);
}

export function displayChange(score: number, type: string) {
	// TODO: Display type in cycle changes box
	if (score || type) return;
	return;
}
