import ReconnectingWebSocket from "reconnecting-websocket";
import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";
import { Cycle, Message, RunState } from "./types.ts";
import { createSocket } from "./socket.ts";

const chosenLayout = getSetting("layout");
const layout = getLayout(chosenLayout);
const layoutData = layout.layoutDataGetter();
let styleTags = "";
if (typeof layoutData.stylePath == "object") {
	layoutData.stylePath.forEach((path) => {
		styleTags += `<link rel="stylesheet" href="${path}">`;
	});
} else {
	styleTags = `<link rel="stylesheet" href="${layoutData.stylePath}">`;
}
document.querySelector<HTMLDivElement>("#app")!.innerHTML =
	styleTags + layoutData.html.edit;

registerNavbar(document.querySelector("nav")!);

const socket: ReconnectingWebSocket = createSocket();
socket.onopen = () => {
	socket.send(JSON.stringify({ event: "getState" }));
};
socket.onmessage = (event) => {
	let jsonData: Message;
	try {
		jsonData = JSON.parse(event.data) as Message;
	} catch {
		console.error(`Invalid socket message received. Got "${event.data}"`);
		return;
	}
	handleMessage(jsonData);
};

const handleMessage = (data: Message) => {
	console.debug(data);
	if (data.event == "setState") {
		if (data.name) {
			console.log("Received run state, updating info");
			let runState: RunState;
			try {
				runState = JSON.parse(data.name) as RunState;
			} catch {
				console.error(
					`Invalid state JSON received. Got "${data.name}"`,
				);
				return;
			}
			updateDataDisplay(runState);
		}
	} else if (data.event == "addCycle") {
		if (data.name) {
			let newestCycle: Cycle;
			try {
				newestCycle = JSON.parse(data.name) as Cycle;
			} catch {
				console.error(
					`Invalid state JSON received. Got "${data.name}"`,
				);
				return;
			}
			addTableRow(
				null,
				newestCycle.type,
				newestCycle.time,
				newestCycle.score,
			);
		}
	}
};

let timeInputs: HTMLInputElement[] = [];
let typeInputs: HTMLInputElement[] = [];
let scoreInputs: HTMLInputElement[] = [];
let sentCycles: Cycle[] | undefined = undefined;

const saveAction = () => {
	const cycles: Cycle[] = [];
	for (let i = 0; i < timeInputs.length; i++) {
		const timeInput = timeInputs[i];
		const typeInput = typeInputs[i];
		const scoreInput = scoreInputs[i];

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

		cycles.push({
			time: timeValue,
			type: typeValue,
			score: scoreValue,
		});
	}

	sendEditedCycles(cycles);
	sentCycles = cycles;
};

const submit = document.getElementById("edit-table-save-button");
submit?.addEventListener("click", saveAction);

function updateDataDisplay(runData: RunState) {
	const table = document.getElementById(
		"edit-scores-table",
	) as HTMLTableElement;
	const oldTableBody = document.getElementById("edit-table-body");

	if (!runData.running) {
		return;
	}

	if (
		sentCycles &&
		sentCycles.length == runData.cycles.length &&
		JSON.stringify(sentCycles) === JSON.stringify(runData.cycles)
	) {
		return;
	}

	timeInputs = [];
	typeInputs = [];
	scoreInputs = [];

	oldTableBody?.remove();
	const newTableBody = document.createElement("tbody");
	newTableBody.id = "edit-table-body";
	table.appendChild(newTableBody);
	for (const cycle of runData.cycles) {
		addTableRow(newTableBody, cycle.type, cycle.time, cycle.score);
	}
}

function addTableRow(
	tableBody: HTMLTableSectionElement | null,
	typeNew: string,
	timeNew: number | undefined,
	scoreNew: number | undefined,
	afterRow?: HTMLTableRowElement,
) {
	tableBody ??= document.getElementById(
		"edit-table-body",
	)! as HTMLTableSectionElement;
	const row = afterRow
		? tableBody.insertBefore(
				document.createElement("tr"),
				afterRow.nextSibling,
			)
		: tableBody.appendChild(document.createElement("tr"));
	const newIndex = afterRow
		? Array.prototype.indexOf.call(tableBody.children, afterRow) + 1
		: tableBody.children.length;
	row.className = "data-row";
	const functionsDiv = document.createElement("div");
	functionsDiv.className = "functions-div";
	const deleteButton = document.createElement("button");
	deleteButton.classList.add("delete-button");
	deleteButton.classList.add("edit-table-button");
	functionsDiv.appendChild(deleteButton);
	const addButton = document.createElement("button");
	addButton.classList.add("add-button");
	addButton.classList.add("edit-table-button");
	functionsDiv.appendChild(addButton);
	row.insertCell(0).appendChild(functionsDiv);

	let tableData = row.appendChild(document.createElement("td"));
	const timeInput = tableData.appendChild(document.createElement("input"));
	timeInputs.splice(newIndex, 0, timeInput);
	if (timeNew != undefined) {
		timeInput.value = String(timeNew);
		timeInput.placeholder = String(timeNew);
	}
	timeInput.className = "data-input";
	timeInput.addEventListener("focusout", () => {
		const parsedValue = Number(timeInput.value);
		if (
			(isNaN(parsedValue) ||
				!isFinite(parsedValue) ||
				parsedValue <= 0) &&
			timeInput.value.length > 0
		) {
			timeInput.classList.add("invalid");
		} else {
			timeInput.classList.remove("invalid");
		}
	});
	timeInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			saveAction();
		}
	});

	tableData = row.appendChild(document.createElement("td"));
	const typeInput = tableData.appendChild(document.createElement("input"));
	typeInputs.splice(newIndex, 0, typeInput);
	typeInput.className = "data-input";
	typeInput.value = typeNew;
	typeInput.placeholder = typeNew;
	typeInput.addEventListener("focusout", () => {
		const value = typeInput.value;
		if (value.trim().length == 0 && value.length > 0) {
			typeInput.classList.add("invalid");
		} else {
			typeInput.classList.remove("invalid");
		}
	});
	typeInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			saveAction();
		}
	});

	tableData = row.appendChild(document.createElement("td"));
	const scoreInput = tableData.appendChild(document.createElement("input"));
	scoreInputs.splice(newIndex, 0, scoreInput);
	if (scoreNew != undefined) {
		scoreInput.value = String(scoreNew);
		scoreInput.placeholder = String(scoreNew);
	}
	scoreInput.className = "data-input";
	scoreInput.addEventListener("focusout", () => {
		const parsedValue = Number(scoreInput.value);
		if (
			(isNaN(parsedValue) ||
				!isFinite(parsedValue) ||
				!Number.isInteger(parsedValue)) &&
			scoreInput.value.length > 0
		) {
			scoreInput.classList.add("invalid");
		} else {
			scoreInput.classList.remove("invalid");
		}
	});
	scoreInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			saveAction();
		}
	});

	deleteButton.addEventListener("click", () => {
		tableBody.removeChild(row);
		timeInputs.splice(timeInputs.indexOf(timeInput), 1);
		typeInputs.splice(typeInputs.indexOf(typeInput), 1);
		scoreInputs.splice(scoreInputs.indexOf(scoreInput), 1);
	});

	addButton.classList.add("editModalAddButton");
	addButton.addEventListener("click", () => {
		addTableRow(tableBody, "", undefined, undefined, row);
	});
}

const sendEditedCycles = (cycles: Cycle[]) => {
	if (socket.readyState == WebSocket.OPEN) {
		const data: Message = {
			event: "editRun",
			name: JSON.stringify({ cycles: cycles }),
		};
		socket.send(JSON.stringify(data));
	} else {
		console.error("Edited Run could not be saved. Disconnected from WS");
	}
};
