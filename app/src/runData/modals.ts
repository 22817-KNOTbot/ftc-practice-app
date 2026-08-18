import Choices from "choices.js";
import { CycleStat, getSetting } from "../settingsManager";
import { Cycle, RunData, SaveRunData } from "../types";
import { RunDataInputs, setupDataInputs, updateData } from "./runDataInput";
import strftime from "strftime";
import "choices.js/public/assets/styles/choices.css";

interface Modal extends RunDataInputs {
	modalElement: Element;
	contentElement: Element;
	type: "save" | "edit";
	nameInput?: HTMLInputElement;
	dateInput?: HTMLInputElement;
	teleopTimesStartInput?: HTMLInputElement;
	teleopTimesEndInput?: HTMLInputElement;
	infoList?: HTMLUListElement;
	cycleInfoList?: HTMLUListElement;
}

function initModal(modalElement: HTMLElement, titleText: string) {
	const title = modalElement.querySelector("#modalHeader")!;
	const content = modalElement.querySelector("#modalContent")!;
	modalElement.classList.add("shownModal");

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = titleText;

	return content;
}

function closeModal(modalElement: HTMLElement) {
	modalElement.classList.remove("shownModal");
}

export function showSaveModal(
	modalElement: HTMLElement,
	data: SaveRunData,
	saveCallback: (data: RunData) => void,
) {
	const content = initModal(modalElement, "Save Run");

	const form = content.appendChild(document.createElement("form"));

	const inputLabel = form.appendChild(document.createElement("label"));
	inputLabel.id = "runNameInputLabel";
	inputLabel.setAttribute("for", "runNameInput");
	inputLabel.textContent = "Run name";

	const nameInput = form.appendChild(document.createElement("input"));
	nameInput.id = "runNameInput";
	nameInput.classList.add("runSaveInput");
	nameInput.setAttribute("type", "text");
	nameInput.setAttribute("placeholder", "Run name");
	nameInput.value = strftime(getSetting("defaultName"));

	const tagInputElement = form.appendChild(document.createElement("input"));
	tagInputElement.id = "runTagInput";
	tagInputElement.classList.add("runSaveInput");
	tagInputElement.setAttribute("type", "text");
	tagInputElement.setAttribute("placeholder", "Tags (optional)");

	const tagInput = new Choices(tagInputElement, {
		removeItemButton: true,
		duplicateItemsAllowed: false,
		items: getSetting("defaultTags"),
		placeholderValue: tagInputElement.placeholder,
	});

	form.getElementsByClassName("choices")[0].id = "runTagInputBox";

	console.log(tagInput.getValue(true));

	const discard = form.appendChild(document.createElement("input"));
	discard.id = "runDiscard";
	discard.setAttribute("type", "button");
	discard.value = "Discard";

	const submit = form.appendChild(document.createElement("input"));
	submit.id = "runNameSubmit";
	submit.setAttribute("type", "submit");
	submit.value = "Save";

	const modal: Modal = {
		modalElement: modalElement,
		contentElement: content,
		type: "save",
		nameInput: nameInput,
		timeInputs: [],
		typeInputs: [],
		scoreInputs: [],
	};

	setupCommonModalElements(modal, data);

	submit.addEventListener("click", (event) => {
		event.preventDefault();
		const runData = updateModalData(modal, data);
		saveCallback(runData);
		closeModal(modalElement);
	});

	discard.addEventListener("click", () => {
		closeModal(modalElement);
	});
}

export function showEditModal(
	modalElement: HTMLElement,
	data: RunData,
	saveCallback: (data: RunData) => void,
) {
	const content = initModal(modalElement, "");

	const title = modalElement.querySelector("#modalHeader")!;
	title.textContent = "";
	const nameInput = title.appendChild(document.createElement("input"));
	nameInput.classList.add("editModalInput", "editModalTitle");
	nameInput.value = data.name;
	nameInput.placeholder = data.name;

	nameInput.addEventListener("focusout", () => {
		const value = nameInput.value;
		if (value.trim().length == 0 && value.length > 0) {
			nameInput.classList.add("invalid");
		} else {
			nameInput.classList.remove("invalid");
		}
	});

	const modal: Modal = {
		modalElement: modalElement,
		contentElement: content,
		type: "edit",
		nameInput: nameInput,
		timeInputs: [],
		typeInputs: [],
		scoreInputs: [],
	};

	setupCommonModalElements(modal, data);

	// Buttons
	const saveButton = content.appendChild(document.createElement("button"));
	saveButton.id = "saveEdit";
	saveButton.textContent = "Save Edits";
	saveButton.classList.add("modalButton");
	saveButton.addEventListener("click", () => {
		const editedRunData: RunData = updateModalData(modal, data);
		saveCallback(editedRunData);
	});

	const discardButton = content.appendChild(document.createElement("button"));
	discardButton.id = "discardEdit";
	discardButton.textContent = "Discard Edits";
	discardButton.classList.add("modalButton");
	discardButton.addEventListener("click", () => {
		modalElement.classList.remove("shownModal");
	});
}

function setupCommonModalElements(modal: Modal, data: RunData | SaveRunData) {
	let infoHeader: HTMLElement = modal.contentElement.appendChild(
		document.createElement("h2"),
	);
	infoHeader.className = "firstModalHeader";
	infoHeader = infoHeader.appendChild(document.createElement("u"));
	infoHeader.textContent = "Info";

	const subtitleDiv = modal.contentElement.appendChild(
		document.createElement("div"),
	);
	const subtitle = subtitleDiv.appendChild(document.createElement("h3"));
	const dateInput = subtitleDiv.appendChild<HTMLInputElement>(
		document.createElement("input"),
	);
	subtitle.className = "modalContentSubtitle editModalSubtitle";
	dateInput.type = "datetime-local";
	dateInput.id = "editModalDate";
	dateInput.classList.add("editModalInput");
	const rawDate: Date = new Date(
		modal.type == "save"
			? Math.floor(Date.now() / 1e3) * 1e3
			: data.timestamp * 1000,
	);
	// Date inputs don't use time zones. Manually adjusting for time zones before passing it as input
	subtitle.textContent = "Date: ";
	dateInput.valueAsNumber =
		rawDate.getTime() - rawDate.getTimezoneOffset() * 60 * 1000;
	dateInput.placeholder = rawDate.toString();
	dateInput.addEventListener("focusout", () => {
		const date = dateInput.valueAsNumber;
		if (isNaN(date)) {
			dateInput.classList.add("invalid");
		} else {
			dateInput.classList.remove("invalid");
		}
	});

	const infoList = modal.contentElement.appendChild(
		document.createElement("ul"),
	);

	const cycleHeader = modal.contentElement
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	cycleHeader.textContent = "Cycles";

	const cycleTable = modal.contentElement.appendChild(
		document.createElement("table"),
	);
	cycleTable.id = "cycleTable";
	cycleTable.className = "editCycleTable";
	const tableHeaderRow = cycleTable.appendChild(document.createElement("tr"));
	let header = tableHeaderRow.appendChild(document.createElement("th"));
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Time (s)";
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Type";
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Score";

	let initialRowsAdded = false;

	const addRow = (cycle?: Cycle) => {
		const row = cycleTable.appendChild(document.createElement("tr"));
		let tableData = row.appendChild(document.createElement("td"));
		const deleteButton = tableData.appendChild(
			document.createElement("button"),
		);
		deleteButton.classList.add("editModalDeleteButton");

		tableData = row.appendChild(document.createElement("td"));
		const timeInput = tableData.appendChild(
			document.createElement("input"),
		);
		timeInput.classList.add("editModalInput", "editModalTableInput");
		modal.timeInputs.push(timeInput);
		timeInput.value = cycle?.time.toString() ?? "";
		timeInput.placeholder = cycle?.time.toString() ?? "";

		tableData = row.appendChild(document.createElement("td"));
		const typeInput = tableData.appendChild(
			document.createElement("input"),
		);
		typeInput.classList.add("editModalInput", "editModalTableInput");
		modal.typeInputs.push(typeInput);
		typeInput.value = cycle?.type ?? "";
		typeInput.placeholder = cycle?.type ?? "";

		tableData = row.appendChild(document.createElement("td"));
		const scoreInput = tableData.appendChild(
			document.createElement("input"),
		);
		scoreInput.classList.add("editModalInput", "editModalTableInput");
		modal.scoreInputs.push(scoreInput);
		scoreInput.value = cycle?.score.toString() ?? "";
		scoreInput.placeholder = cycle?.score.toString() ?? "";

		// Event listeners
		deleteButton.addEventListener("click", () => {
			cycleTable.removeChild(row);
			modal.timeInputs.splice(modal.timeInputs.indexOf(timeInput), 1);
			modal.typeInputs.splice(modal.typeInputs.indexOf(typeInput), 1);
			modal.scoreInputs.splice(modal.scoreInputs.indexOf(scoreInput), 1);
			updateLiveInfo(modal, updateData(modal, data));
		});

		if (initialRowsAdded) {
			setupDataInputs(modal, () => {
				updateLiveInfo(modal, updateData(modal, data));
			});
		}
	};

	for (const cycle of data.cycles) {
		addRow(cycle);
	}
	initialRowsAdded = true;
	setupDataInputs(modal, () => {
		updateLiveInfo(modal, updateData(modal, data));
	});

	const row = cycleTable.appendChild(document.createElement("tr"));
	const tableData = row.appendChild(document.createElement("td"));
	const addButton = tableData.appendChild(document.createElement("button"));
	addButton.classList.add("editModalAddButton");
	addButton.addEventListener("click", () => {
		cycleTable.removeChild(row);
		addRow();
		cycleTable.appendChild(row);
		updateLiveInfo(modal, updateData(modal, data));
	});

	const cycleInfoSubtitle = modal.contentElement.appendChild(
		document.createElement("h3"),
	);
	cycleInfoSubtitle.className = "modalContentSubtitle";
	cycleInfoSubtitle.textContent = "Statistics";

	const cycleInfoList = modal.contentElement.appendChild(
		document.createElement("ul"),
	);

	// TeleOp Times calculations
	if (
		(<SaveRunData>data).periodTimes != undefined || // Check if data is instance of SaveRunData
		data.teleopTimes == undefined ||
		data.teleopTimes[0] == null ||
		data.teleopTimes[1] == null
	) {
		const periodTimes = (data as SaveRunData).periodTimes;
		const timerValues = getSetting("timerValues");
		data.teleopTimes = [null, null];
		const expectedStartTime =
			data.startingMatchPeriod == "AUTO"
				? timerValues["auto"] + timerValues["transition"]
				: data.startingMatchPeriod == "TRANSITION"
					? timerValues["transition"]
					: 0;
		const teleopStartDifference: number | null =
			periodTimes[0] == null || periodTimes[1] == null
				? null
				: (periodTimes[1] - periodTimes[0]) / 1e3 - expectedStartTime;
		if (teleopStartDifference != null) {
			data.teleopTimes[0] = Math.floor(teleopStartDifference * 1e3);
		}

		const teleopEndDifference: number | null =
			periodTimes[1] == null || periodTimes[2] == null
				? null
				: (periodTimes[2] - periodTimes[1]) / 1e3 -
					timerValues["teleop"];
		if (teleopEndDifference != null) {
			data.teleopTimes[1] = Math.floor(teleopEndDifference * 1e3);
		}
	}

	const teleopTimesHeader = modal.contentElement
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	teleopTimesHeader.textContent = "TeleOp Times";

	const teleopTimesStart = modal.contentElement.appendChild(
		document.createElement("div"),
	);
	teleopTimesStart.classList.add("editModalTeleopLine");
	teleopTimesStart.textContent = "TeleOp start: ";
	const teleopTimesStartInput = teleopTimesStart.appendChild(
		document.createElement("input"),
	);
	teleopTimesStartInput.classList.add("editModalInput");

	const teleopStartTime =
		data.teleopTimes[0] != null
			? (data.teleopTimes[0] / 1e3).toFixed(3)
			: "";
	teleopTimesStartInput.value = teleopStartTime;
	teleopTimesStartInput.placeholder = teleopStartTime;

	teleopTimesStartInput.addEventListener("focusout", () => {
		const parsedValue = Number(teleopTimesStartInput.value);
		if (
			(isNaN(parsedValue) || !isFinite(parsedValue)) &&
			teleopTimesStartInput.value.trim().length > 0
		) {
			teleopTimesStartInput.classList.add("invalid");
		} else {
			teleopTimesStartInput.classList.remove("invalid");
		}
	});

	const teleopTimesEnd = modal.contentElement.appendChild(
		document.createElement("div"),
	);
	teleopTimesEnd.classList.add("editModalTeleopLine");
	teleopTimesEnd.textContent = "TeleOp end: ";
	const teleopTimesEndInput = teleopTimesEnd.appendChild(
		document.createElement("input"),
	);
	teleopTimesEndInput.classList.add("editModalInput");

	const teleopEndTime =
		data.teleopTimes[1] != null
			? (data.teleopTimes[1] / 1e3).toFixed(3)
			: "";
	teleopTimesEndInput.value = teleopEndTime;
	teleopTimesEndInput.placeholder = teleopEndTime;

	teleopTimesEndInput.addEventListener("focusout", () => {
		const parsedValue = Number(teleopTimesEndInput.value);
		if (
			(isNaN(parsedValue) || !isFinite(parsedValue)) &&
			teleopTimesEndInput.value.trim().length > 0
		) {
			teleopTimesEndInput.classList.add("invalid");
		} else {
			teleopTimesEndInput.classList.remove("invalid");
		}
	});

	modal.dateInput = dateInput;
	modal.teleopTimesStartInput = teleopTimesStartInput;
	modal.teleopTimesEndInput = teleopTimesEndInput;
	modal.infoList = infoList;
	modal.cycleInfoList = cycleInfoList;

	updateLiveInfo(modal, updateData(modal, data));
}

function updateModalData(modal: Modal, data: RunData): RunData {
	if (
		modal.nameInput == undefined ||
		modal.dateInput == undefined ||
		modal.teleopTimesStartInput == undefined ||
		modal.teleopTimesEndInput == undefined ||
		modal.infoList == undefined ||
		modal.cycleInfoList == undefined
	) {
		throw new Error("Modal inputs are not defined");
	}

	let nameValue = modal.nameInput.value;
	// Save modal can be empty to indicate discard
	if (
		modal.type == "edit" &&
		nameValue.trim().length == 0 &&
		nameValue.length > 0
	) {
		nameValue = modal.nameInput.placeholder;
	}

	const dateNum = modal.dateInput.valueAsNumber;
	let date: Date;
	if (isNaN(dateNum)) {
		date = new Date(modal.dateInput.placeholder);
	} else {
		date = new Date(dateNum + new Date().getTimezoneOffset() * 60 * 1000);
	}

	let teleopTimes: RunData["teleopTimes"] = [];
	let teleopTimesStartValue = Number(modal.teleopTimesStartInput.value);
	let teleopTimesEndValue = Number(modal.teleopTimesEndInput.value);
	if (isNaN(teleopTimesStartValue) || !isFinite(teleopTimesStartValue)) {
		teleopTimesStartValue = Number(modal.teleopTimesStartInput.placeholder);
	}
	if (isNaN(teleopTimesEndValue) || !isFinite(teleopTimesEndValue)) {
		teleopTimesEndValue = Number(modal.teleopTimesEndInput.placeholder);
	}
	if (modal.teleopTimesEndInput.value.trim().length != 0) {
		teleopTimes = [
			Math.floor(
				(isNaN(teleopTimesStartValue) ? 0 : teleopTimesStartValue) *
					1000,
			),
			Math.floor(teleopTimesEndValue * 1000),
		];
	} else if (modal.teleopTimesStartInput.value.trim().length != 0) {
		teleopTimes = [Math.floor(teleopTimesStartValue) * 1000];
	}

	return updateData(modal, {
		name: nameValue,
		timestamp: Math.floor(date.getTime() / 1000),
		score: 0,
		info: {},
		cycles: [],
		teleopTimes: teleopTimes,
		startingMatchPeriod: data.startingMatchPeriod,
	});
}

// Function is designed for modals but can be reused for other elements that have the same structure
// as a modal, therefore can also except only infoList and cycleInfoList instead of a full modal
export function updateLiveInfo(
	modal: Modal | { infoList: HTMLElement; cycleInfoList: HTMLElement },
	data: RunData,
) {
	if (modal.infoList == undefined || modal.cycleInfoList == undefined) {
		throw new Error("Modal inputs are not defined");
	}

	modal.infoList.textContent = "";
	for (const type in data.info) {
		const li = modal.infoList.appendChild(document.createElement("li"));
		li.textContent = `${type}: ${data.info[type]}`;
	}

	modal.cycleInfoList.textContent = "";
	if (data.cycles.length > 0) {
		const cycleStats = getSetting("cycleStats");

		if (cycleStats.length <= 0) {
			return;
		}

		const cycleTimes = data.cycles.map((cycle) => {
			return cycle.time;
		});
		let minTime: number | undefined;
		let maxTime: number | undefined;
		let cycleTimeSum = 0;
		cycleTimes.forEach((time) => {
			minTime = minTime == undefined ? time : Math.min(minTime, time);
			maxTime = maxTime == undefined ? time : Math.max(maxTime, time);
			cycleTimeSum += time;
		});
		const sortedCycleTimes = [...cycleTimes].sort((a, b) => a - b);

		for (const cycleStat of cycleStats) {
			let output: string = "Unknown";
			switch (cycleStat) {
				case CycleStat.MIN:
					output = `${minTime!.toFixed(3)}s`;
					break;
				case CycleStat.MAX:
					output = `${maxTime!.toFixed(3)}s`;
					break;
				case CycleStat.MEAN:
					output = `${(cycleTimeSum / cycleTimes.length).toFixed(3)}s`;
					break;
				case CycleStat.MEDIAN: {
					const halfIndex = Math.floor(sortedCycleTimes.length / 2);
					const median =
						sortedCycleTimes.length % 2
							? sortedCycleTimes[halfIndex]
							: sortedCycleTimes[halfIndex - 1] +
								sortedCycleTimes[halfIndex] / 2;
					output = `${median.toFixed(3)}s`;
					break;
				}
				case CycleStat.SECS_PER_POINT:
					output = `${(cycleTimeSum / data.score).toFixed(3)}s`;
					break;
				case CycleStat.POINTS_PER_SEC:
					output = `${(data.score / cycleTimeSum).toFixed(3)}pts`;
					break;
				case CycleStat.STD_DEV: {
					const mean = cycleTimeSum / cycleTimes.length;
					const stdDev = Math.sqrt(
						cycleTimes
							.map((x) => (x - mean) * (x - mean))
							.reduce((a, b) => a + b) / cycleTimes.length,
					);
					output = `${stdDev.toFixed(3)}s`;
					break;
				}
				// Sorted array is from lowest to highest.
				// Lowest is considered best, therefore numbers will be reversed
				case CycleStat.HIGH_25:
				case CycleStat.LOW_25:
				case CycleStat.HIGH_10:
				case CycleStat.LOW_10: {
					let percentileCoeff = 0;
					switch (cycleStat) {
						case CycleStat.HIGH_25:
							percentileCoeff = 0.25;
							break;
						case CycleStat.LOW_25:
							percentileCoeff = 0.75;
							break;
						case CycleStat.HIGH_10:
							percentileCoeff = 0.1;
							break;
						case CycleStat.LOW_10:
							percentileCoeff = 0.9;
							break;
					}
					const rank =
						(sortedCycleTimes.length - 1) * percentileCoeff;
					const lowIndex = Math.floor(rank);
					const low = sortedCycleTimes[lowIndex];
					const high =
						sortedCycleTimes.length > 1
							? sortedCycleTimes[lowIndex + 1]
							: low;
					const num = low + (high - low) * (rank - Math.trunc(rank));
					output = `${num.toFixed(3)}s`;
					break;
				}
			}

			modal.cycleInfoList.appendChild(
				document.createElement("li"),
			).textContent = `${cycleStat}: ${output}`;
		}
	}
}
