import { updateTextSize } from "auto-text-size";

let oldScore = 0;
let currentScore = 0;
export function setScore(element: HTMLElement, score: number) {
	score = Math.floor(score);
	element.textContent = `${score}`;
	currentScore = score;
}

const changes: { score: number; type: string; time: number }[] = [];
const shiftChanges = (element: HTMLElement) => {
	for (const child of element.children) {
		child.getAnimations().forEach((animation) => {
			animation.cancel();
		});
	}
	const change0 = element.getElementsByClassName("change-0")[0]!;
	const change1 = element.getElementsByClassName("change-1")[0]!;
	const change2 = element.getElementsByClassName("change-2")[0]!;
	const change3 = element.getElementsByClassName("change-3")[0]!;
	change0.classList.replace("change-0", "change-3");
	change1.classList.replace("change-1", "change-0");
	change2.classList.replace("change-2", "change-1");
	change3.classList.replace("change-3", "change-2");
};

export function displayChange(
	element: HTMLElement,
	type?: string,
	time?: number,
	score?: number
) {
	score ??= currentScore - oldScore;
	type ??= "Score";

	const newChange = element.getElementsByClassName("change-3")[0]!
		.children[0] as HTMLElement;

	newChange.textContent = `
		${score >= 0 ? "+" : "-"}${Math.abs(score)} - 
		${type}
		${time == undefined ? "" : " - " + time.toFixed(3)}
	`;

	updateTextSize({
		innerEl: newChange,
		containerEl: newChange.parentElement!,
		mode: "boxoneline",
	});

	shiftChanges(element);

	changes.push({ score: score, type: type, time: time ?? 0 });
	if (changes.length > 2) {
		changes.shift();
	}

	oldScore = currentScore;
}
export function clearChanges(element: HTMLElement) {
	oldScore = 0;
	changes.length = 0;
	for (const child of element.children) {
		child.textContent = "";
	}
}
