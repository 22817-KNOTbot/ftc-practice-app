import ReconnectingWebSocket from "reconnecting-websocket";
import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";
import { Cycle, MatchPeriod, Message, RunState } from "./types.ts";
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
					`Invalid state JSON received. Got "${data.name}"`
				);
				return;
			}
			updateDataDisplay(runState);
		}
	} else if (data.event == "addCycle") {
		if(data.name) {
			console.log("Received run state, updating info");
			let newestCycle: Cycle;
			try {
				newestCycle = JSON.parse(data.name) as Cycle;
			} catch {
				console.error(
					`Invalid state JSON received. Got "${data.name}"`
				);
				return;
			}
			addTableRow(newestCycle.type, newestCycle.time, newestCycle.score)
		}
	}
}
//placeholdercode
const runData: RunState = {
	running: true,
	matchPeriod: MatchPeriod.AUTO,
	periodTime: 25,
	score: 30,
	cycles: [
		{
			time: 2,
			type: "shoot",
			score: 1
		},
		{
			time: 2,
			type: "leave",
			score: 2
		},
		{
			time: 2,
			type: "shoot",
			score: 3
		},
		{
			time: 2,
			type: "shoot",
			score: 4
		},
		{
			time: 2,
			type: "shoot",
			score: 5
		},
		{
			time: 2,
			type: "shoot",
			score: 6
		},
	],
	cycleTime: 12
}
updateDataDisplay(runData);
function updateDataDisplay(runData: RunState) {
	const table = document.getElementById("scores-table") as HTMLTableElement;
	const submit = document.getElementById("submit-button");
	let tableBody = document.getElementById("table-body");
	tableBody?.remove();
	tableBody = document.createElement('tbody');
	tableBody.id = "table-body";
	table.appendChild(tableBody);

	if (!runData.running) {
		return;
	}

	
	for (let i = 0; i < runData.cycles.length; i++){
		const row = tableBody.appendChild(document.createElement("tr"));
		row.className = "data-row"
		const deleteButton = document.createElement("button");
		const functionsDiv = document.createElement("div");
		functionsDiv.className = "functions-div";
		functionsDiv.appendChild(deleteButton);
		deleteButton.textContent = "delete";
		deleteButton.className = "delete-button";
		
		row.insertCell(0).appendChild(functionsDiv);
		let tableData = row.appendChild(document.createElement("td"));
		const typeInput = tableData.appendChild(document.createElement("input"));
		typeInput.className = "data-input";
		typeInput.defaultValue = runData.cycles[i].type;
		typeInput.addEventListener("focusout", () => {});
	
		tableData = row.appendChild(document.createElement("td"));
		const scoreInput = tableData.appendChild(document.createElement("input"));
		scoreInput.defaultValue = String(runData.cycles[i].score);
		scoreInput.className = "data-input";
		scoreInput.addEventListener("focusout", () => {
			const parsedValue = Number(scoreInput.value);
			if ((isNaN(parsedValue) || 
						!isFinite(parsedValue) || 
						parsedValue <= 0) && 
						scoreInput.value.length > 0) {
				scoreInput.value = scoreInput.defaultValue;
			}
		});
		
		tableData = row.appendChild(document.createElement("td"));
		const timeInput = tableData.appendChild(document.createElement("input"));
		timeInput.defaultValue = String(runData.cycles[i].time);
		timeInput.className = "data-input";
		timeInput.addEventListener("focusout", () => {
			const parsedValue = Number(timeInput.value);
			if ((isNaN(parsedValue) || 
						!isFinite(parsedValue) || 
						parsedValue <= 0) && 
						timeInput.value.length > 0) {
				timeInput.value = timeInput.defaultValue;
			}
		});
		
		deleteButton.addEventListener("click", () => {
			tableBody.removeChild(row);
			// const listItems = tableBody.querySelectorAll('tr')
			// console.log(listItems);
			// console.log(runData.cycles);
			// console.log(buttonId);
			// console.log(row.className);
		});
	}
	
	submit?.addEventListener("click", () => {
		if (!runData) return;
		updateData(runData);
	});
}

function addTableRow(typeNew: string, timeNew: number, scoreNew: number) {
	const tableBody = document.getElementById("table-body")!;
	const row = tableBody.appendChild(document.createElement("tr"));
	row.className = "data-row"
	const deleteButton = document.createElement("button");
	const functionsDiv = document.createElement("div");
	functionsDiv.className = "functions-div";
	functionsDiv.appendChild(deleteButton);
	deleteButton.textContent = "delete";
	deleteButton.className = "delete-button";

	row.insertCell(0).appendChild(deleteButton);
	let tableData = row.appendChild(document.createElement("td"));
	const typeInput = tableData.appendChild(document.createElement("input"));
	typeInput.className = "data-input";
	typeInput.defaultValue = typeNew;
	typeInput.addEventListener("focusout", () => {
	});

	tableData = row.appendChild(document.createElement("td"));
	const scoreInput = tableData.appendChild(document.createElement("input"));
	scoreInput.defaultValue = String(scoreNew);
	scoreInput.className = "data-input";
	scoreInput.addEventListener("focusout", () => {
		const parsedValue = Number(scoreInput.value);
		if ((isNaN(parsedValue) || 
					!isFinite(parsedValue) || 
					parsedValue <= 0) && 
					scoreInput.value.length > 0) {
			scoreInput.value = scoreInput.defaultValue;
		}
	});

	tableData = row.appendChild(document.createElement("td"));
	const timeInput = tableData.appendChild(document.createElement("input"));
	timeInput.defaultValue = String(timeNew);
	timeInput.className = "data-input";
	timeInput.addEventListener("focusout", () => {
		const parsedValue = Number(timeInput.value);
		if ((isNaN(parsedValue) || 
					!isFinite(parsedValue) || 
					parsedValue <= 0) && 
					timeInput.value.length > 0) {
			timeInput.value = timeInput.defaultValue;
		}
	});

	deleteButton.addEventListener("click", () => {
		tableBody.removeChild(row);
		// const listItems = tableBody.querySelectorAll('tr')
		// console.log(listItems);
		// console.log(runData.cycles);
		// console.log(buttonId);
		// console.log(row.className);
	});
}

const updateData = (runData: RunState) => {
	const table = document.getElementById("scores-table") as HTMLTableElement;
	if (runData.running) {
		const newRunData = runData
		newRunData.cycles = [];
		for (let i = 1; i < table.rows.length; i++){
			const cells = table.rows[i].getElementsByTagName("td");
			runData.cycles[i].time = parseFloat(cells[1].querySelector("input")!.value);
			runData.cycles[i].score = parseInt(cells[2].querySelector("input")!.value);
			runData.cycles[i].type = cells[3].querySelector("input")!.value;
		}

		if (socket.readyState == WebSocket.OPEN) {
			const data: Message = {
				event: "editRun",
				name: JSON.stringify(runData),
			};
			socket.send(JSON.stringify(data));
		} else {
			console.error("Edited Run could not be saved. Disconnected from WS");
		}
	}

}