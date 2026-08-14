import { Cycle, RunData } from "../types";

export interface RunDataInputs {
	timeInputs: HTMLInputElement[];
	typeInputs: HTMLInputElement[];
	scoreInputs: HTMLInputElement[];
}

export function updateData(dataInputs: RunDataInputs, data: RunData): RunData {
	let score = 0;
	const info: RunData["info"] = {};
	const cycles: Cycle[] = [];
	for (let i = 0; i < dataInputs.timeInputs.length; i++) {
		const timeInput = dataInputs.timeInputs[i];
		const typeInput = dataInputs.typeInputs[i];
		const scoreInput = dataInputs.scoreInputs[i];

		if (
			(timeInput.value.trim().length <= 0 &&
				timeInput.placeholder.trim().length <= 0) ||
			(typeInput.value.trim().length <= 0 &&
				typeInput.placeholder.trim().length <= 0) ||
			(scoreInput.value.trim().length <= 0 &&
				scoreInput.placeholder.trim().length <= 0)
		)
			continue;

		let timeValue = Number(timeInput.value);
		let typeValue = typeInput.value;
		let scoreValue = Number(scoreInput.value);

		if (isNaN(timeValue) || !isFinite(timeValue) || timeValue <= 0) {
			timeValue = Number(timeInput.placeholder);
		}
		if (typeValue.trim().length == 0) {
			typeValue = typeInput.placeholder;
		}
		if (
			isNaN(scoreValue) ||
			!isFinite(scoreValue) ||
			!Number.isInteger(scoreValue) ||
			scoreInput.value.trim().length <= 0
		) {
			scoreValue = Number(scoreInput.placeholder);
		}

		score += scoreValue;
		info[typeValue] = (info[typeValue] ?? 0) + 1;

		cycles.push({
			time: timeValue,
			type: typeValue,
			score: scoreValue,
		});
	}

	data.score = score;
	data.info = info;
	data.cycles = cycles;
	return data;
}

export function setupDataInputs(
	dataInputs: RunDataInputs,
	updateCallback?: () => void,
) {
	for (const timeInput of dataInputs.timeInputs) {
		if (timeInput.dataset.listenerAttached === "true") continue;
		timeInput.dataset.listenerAttached = "true";
		timeInput.addEventListener("focusout", () => {
			const parsedValue = Number(timeInput.value);
			if (
				(isNaN(parsedValue) ||
					!isFinite(parsedValue) ||
					parsedValue < 0 ||
					timeInput.value.trim().length <= 0) &&
				(timeInput.value.length > 0 ||
					timeInput.placeholder.length <= 0)
			) {
				timeInput.classList.add("invalid");
			} else {
				timeInput.classList.remove("invalid");
			}
			if (updateCallback) {
				updateCallback();
			}
		});
	}

	for (const typeInput of dataInputs.typeInputs) {
		if (typeInput.dataset.listenerAttached === "true") continue;
		typeInput.dataset.listenerAttached = "true";
		typeInput.addEventListener("focusout", () => {
			const value = typeInput.value;
			if (
				value.trim().length <= 0 &&
				(value.length > 0 || typeInput.placeholder.length <= 0)
			) {
				typeInput.classList.add("invalid");
			} else {
				typeInput.classList.remove("invalid");
			}
			if (updateCallback) {
				updateCallback();
			}
		});
	}

	for (const scoreInput of dataInputs.scoreInputs) {
		if (scoreInput.dataset.listenerAttached === "true") continue;
		scoreInput.dataset.listenerAttached = "true";
		scoreInput.addEventListener("focusout", () => {
			const parsedValue = Number(scoreInput.value);
			if (
				(isNaN(parsedValue) ||
					!isFinite(parsedValue) ||
					!Number.isInteger(parsedValue) ||
					scoreInput.value.trim().length <= 0) &&
				(scoreInput.value.length > 0 ||
					scoreInput.placeholder.length <= 0)
			) {
				scoreInput.classList.add("invalid");
			} else {
				scoreInput.classList.remove("invalid");
			}
			if (updateCallback) {
				updateCallback();
			}
		});
	}
}
