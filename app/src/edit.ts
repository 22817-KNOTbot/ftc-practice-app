import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";
import { MatchPeriod, RunState } from "./types.ts";


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

const table = document.getElementById("scores-table") as HTMLTableElement;
const submit = document.getElementById("submit");
const rows: HTMLTableRowElement[] = [];
const typeInputs: HTMLInputElement[] = [];
const timeInputs: HTMLInputElement[] = [];
const scoreInputs: HTMLInputElement[] = [];

for (let i = 0; i < runData.cycles.length; i++){
	const row = table.appendChild(document.createElement("tr"));
	rows.push(row)
	row.className = String(i) + "data-row"
	const deleteButton = document.createElement("button");
	const functionsDiv = document.createElement("div");
	functionsDiv.appendChild(deleteButton);
	deleteButton.textContent = "delete";
	deleteButton.className = String(i) + "delete-button";

	row.insertCell(0).appendChild(functionsDiv);
	let tableData = row.appendChild(document.createElement("td"));
	const typeInput = tableData.appendChild(document.createElement("input"));
	typeInput.defaultValue = runData.cycles[i].type;
	typeInputs.push(typeInput)
	typeInput.addEventListener("focusout", () => {
		updateData();
	});

	tableData = row.appendChild(document.createElement("td"));
	const scoreInput = tableData.appendChild(document.createElement("input"));
	scoreInput.defaultValue = String(runData.cycles[i].score);
	scoreInputs.push(scoreInput)
	scoreInput.addEventListener("focusout", () => {
		const parsedValue = Number(scoreInput.value);
		if ((isNaN(parsedValue) || 
					!isFinite(parsedValue) || 
					parsedValue <= 0) && 
					scoreInput.value.length > 0) {
			scoreInput.value = scoreInput.defaultValue;
		}
		updateData();
	});
	

	tableData = row.appendChild(document.createElement("td"));
	const timeInput = tableData.appendChild(document.createElement("input"));
	timeInput.defaultValue = String(runData.cycles[i].time);
	timeInputs.push(timeInput)
	timeInput.addEventListener("focusout", () => {
		const parsedValue = Number(timeInput.value);
		if ((isNaN(parsedValue) || 
					!isFinite(parsedValue) || 
					parsedValue <= 0) && 
					timeInput.value.length > 0) {
			timeInput.value = timeInput.defaultValue;
		}
		updateData();
	});
	
	// row.insertCell(1).innerHTML = typeInput.defaultValue;

	// row.insertCell(2).innerHTML = String(runData.cycles[i].score);

	// row.insertCell(3).innerHTML = String(runData.cycles[i].time);

	const buttonId = deleteButton.className[0]+1

	deleteButton.addEventListener("click", () => {
		runData.cycles.splice(rows.indexOf(row), 1);
		rows.splice(rows.indexOf(row), 1)
		typeInputs.splice(typeInputs.indexOf(typeInput), 1)
		timeInputs.splice(timeInputs.indexOf(timeInput), 1)
		scoreInputs.splice(scoreInputs.indexOf(scoreInput), 1)
		table.removeChild(row);
		const listItems = table.querySelectorAll('tr')
		console.log(listItems);
		console.log(runData.cycles);
		console.log(buttonId);
		console.log(row.className);
	});
}

submit?.addEventListener("click", () => {
	console.log(runData)
});

function updateData() {
	for (let i = 0; i < runData.cycles.length; i++){
		//console.log(timeInputs[i].value)
		//console.log(scoreInputs[i].value)
		//console.log(typeInputs[i].value)
		runData.cycles[i].time = timeInputs[i].value
		runData.cycles[i].score = typeInputs[i].value
		runData.cycles[i].type = scoreInputs[i].value
	}
}
