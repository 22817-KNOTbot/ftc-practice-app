import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";
import { MatchPeriod, RunState } from "./types.ts";


const chosenLayout = getSetting("layout");
const layout = getLayout(chosenLayout);
const layoutData = layout.layoutDataGetter();

registerNavbar(document.querySelector("nav")!);

//pseudocode
const runData: RunState = {
	running: true,
	matchPeriod: MatchPeriod.AUTO,
	periodTime: 25,
	score: 30,
	cycles: [
		{
			time: 2,
			type: "shoot",
			score: 5
		},
		{
			time: 20,
			type: "leave",
			score: 25
		}],
	cycleTime: 22
}

let table = document.getElementById("scores-table");

for (let i = 0; i < runData.cycles.length; i++){
	let newRow = table.insertRow(table.rows.length);
	newRow.insertCell(0).innerHTML = runData.cycles[i].type;
	newRow.insertCell(1).innerHTML = runData.cycles[i].score;
	newRow.insertCell(1).innerHTML = runData.cycles[i].time;
}