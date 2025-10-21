import ReconnectingWebSocket from "reconnecting-websocket";
import {
	clearChanges,
	displayChange,
	displayInfo,
	displayInfoColor,
	setScore,
} from "./score.ts";
import { Sounds } from "./sfx.ts";
import { createSocket } from "./socket.ts";
import "./style.css";
import {
	resetStopwatch,
	stopStopwatch,
	setupStopwatch,
	setAutoTimer,
	setTransitionTimer,
	setTeleopTimer,
	registerSounds,
	Timer,
	secsToMins,
} from "./timer.ts";
import { Message, RunData, RunState, SaveRunData } from "./types.ts";
import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";

let running = false;

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
	styleTags + layoutData.html.timer;

registerNavbar(document.querySelector("nav")!);

const sounds: Sounds = new Sounds();
sounds.preload();
registerSounds(sounds);

const timerElement = document.getElementById("timer")!;
const timer = new Timer(timerElement);
const timerValues = getSetting("timerValues");
timerElement.textContent = secsToMins(
	timerValues["auto"] + timerValues["teleop"]
);

const cycleTimer = document.getElementById("cycle-timer")!;

const score = document.getElementById("score")!;
const changesElement = document.getElementById("changes-box")!;

const showSavePrompt = (data: SaveRunData) => {
	const modal = document.getElementById("saveModal")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.classList.add("shownModal");

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = "Save run";

	const form = content.appendChild(document.createElement("form"));

	const inputLabel = form.appendChild(document.createElement("label"));
	inputLabel.id = "runNameInputLabel";
	inputLabel.setAttribute("for", "runNameInput");
	inputLabel.textContent = "Run name";

	const input = form.appendChild(document.createElement("input"));
	input.id = "runNameInput";
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", "Run name");

	const inputNote = form.appendChild(document.createElement("p"));
	inputNote.id = "runNameNote";
	inputNote.textContent = "Leave empty to discard run";

	const submit = form.appendChild(document.createElement("input"));
	submit.id = "runNameSubmit";
	submit.setAttribute("type", "submit");
	submit.value = "Submit";

	const date: Date = new Date();

	submit.addEventListener("click", (event) => {
		event.preventDefault();
		data.name = input.value;
		data.timestamp = Math.floor(date.getTime() / 1000);
		saveRun(data);
		hideSavePrompt();
	});

	let infoHeader: HTMLElement = content.appendChild(
		document.createElement("h2")
	);
	infoHeader = infoHeader.appendChild(document.createElement("u"));
	infoHeader.textContent = "Info";

	const subtitle = content.appendChild(document.createElement("h3"));
	subtitle.className = "modalContentSubtitle";
	const formatDate = date.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
	subtitle.textContent = `Date: ${formatDate}`;

	const infoList = content.appendChild(document.createElement("ul"));

	for (const type in data.info) {
		const li = infoList.appendChild(document.createElement("li"));
		li.textContent = `${type}: ${data.info[type]}`;
	}

	if (data.cycles.length > 0) {
		const cycleHeader = content
			.appendChild(document.createElement("h2"))
			.appendChild(document.createElement("u"));
		cycleHeader.textContent = "Cycles";

		const cycleTable = content.appendChild(document.createElement("table"));
		cycleTable.id = "cycleTable";
		const tableHeaderRow = cycleTable.appendChild(
			document.createElement("tr")
		);
		let header = tableHeaderRow.appendChild(document.createElement("th"));
		header.textContent = "Time (s)";
		header = tableHeaderRow.appendChild(document.createElement("th"));
		header.textContent = "Type";
		header = tableHeaderRow.appendChild(document.createElement("th"));
		header.textContent = "Score";

		for (const cycle in data.cycles) {
			const row = cycleTable.appendChild(document.createElement("tr"));
			let tableData = row.appendChild(document.createElement("td"));
			tableData.textContent = data.cycles[cycle].time
				.toFixed(3)
				.toString();
			tableData = row.appendChild(document.createElement("td"));
			tableData.textContent = data.cycles[cycle].type;
			tableData = row.appendChild(document.createElement("td"));
			tableData.textContent = data.cycles[cycle].score.toString();
		}

		const cycleInfoSubtitle = content.appendChild(
			document.createElement("h3")
		);
		cycleInfoSubtitle.className = "modalContentSubtitle";
		cycleInfoSubtitle.textContent = "Statistics";

		const cycleInfoList = content.appendChild(document.createElement("ul"));
		const cycleTimes = data.cycles.map((cycle) => {
			return cycle.time;
		});

		const minTime = cycleTimes.reduce((a, b) => Math.min(a, b));
		const maxTime = cycleTimes.reduce((a, b) => Math.max(a, b));
		const cycleTimeSum = cycleTimes.reduce((a, b) => a + b);
		const averageTime = cycleTimeSum / cycleTimes.length;
		const secsPerPoint = cycleTimeSum / data.score;
		const pointsPerSec = data.score / cycleTimeSum;

		cycleInfoList.appendChild(
			document.createElement("li")
		).textContent = `Min: ${minTime.toFixed(3)}s`;
		cycleInfoList.appendChild(
			document.createElement("li")
		).textContent = `Max: ${maxTime.toFixed(3)}s`;
		cycleInfoList.appendChild(
			document.createElement("li")
		).textContent = `Mean: ${averageTime.toFixed(3)}s`;
		cycleInfoList.appendChild(
			document.createElement("li")
		).textContent = `Secs/point: ${secsPerPoint.toFixed(3)}s`;
		cycleInfoList.appendChild(
			document.createElement("li")
		).textContent = `Points/sec: ${pointsPerSec.toFixed(3)}`;
	}

	// TeleOp Times
	const expectedStartTime =
		data.startingMatchPeriod == "AUTO"
			? timerValues["auto"] + timerValues["transition"]
			: data.startingMatchPeriod == "TRANSITION"
			? timerValues["transition"]
			: 0;
	const teleopStartDifference: number | null =
		data.periodTimes[0] == null || data.periodTimes[1] == null
			? null
			: (data.periodTimes[1] - data.periodTimes[0]) / 1e3 -
			  expectedStartTime;
	if (teleopStartDifference != null) {
		data.teleopTimes[0] = Math.floor(teleopStartDifference * 1e3);
	}

	const teleopTimesHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	teleopTimesHeader.textContent = "TeleOp Times";

	const teleopTimesStart = content.appendChild(document.createElement("div"));
	if (teleopStartDifference != null) {
		teleopTimesStart.textContent =
			`TeleOp start: ${Math.abs(teleopStartDifference).toFixed(3)}s ` +
			`${
				teleopStartDifference == 0
					? ""
					: teleopStartDifference > 0
					? "late"
					: "early"
			}`;
	}

	const teleopEndDifference: number | null =
		data.periodTimes[1] == null || data.periodTimes[2] == null
			? null
			: (data.periodTimes[2] - data.periodTimes[1]) / 1e3 -
			  timerValues["teleop"];
	if (teleopEndDifference != null) {
		data.teleopTimes[1] = Math.floor(teleopEndDifference * 1e3);
	}

	const teleopTimesEnd = content.appendChild(document.createElement("div"));
	if (teleopEndDifference != null) {
		teleopTimesEnd.textContent =
			`TeleOp end: ${Math.abs(teleopEndDifference).toFixed(3)}s ` +
			`${
				teleopEndDifference == 0
					? ""
					: teleopEndDifference > 0
					? "late"
					: "early"
			}`;
	}
};

const hideSavePrompt = () => {
	const modal = document.getElementById("saveModal");
	if (modal != null) modal.classList.remove("shownModal");
};

const saveRun = (runData: RunData) => {
	if (socket.readyState == WebSocket.OPEN) {
		const data: Message = {
			event: "saveRun",
			name: JSON.stringify(runData),
		};
		socket.send(JSON.stringify(data));
	} else {
		console.error("Run could not be saved. Disconnected from WS");
	}
};

const setState = (runState: RunState) => {
	running = runState.running;
	if (!runState.running) return;

	const period = runState.matchPeriod;
	const periodTime = runState.periodTime;
	let totalTime: number;
	switch (period) {
		case "AUTO":
			totalTime = timerValues["auto"] + timerValues["teleop"];
			setAutoTimer(totalTime - periodTime);
			break;
		case "TRANSITION":
			totalTime = timerValues["transition"];
			setTransitionTimer(totalTime - periodTime);
			break;
		case "TELEOP":
			totalTime = timerValues["teleop"];
			setTeleopTimer(totalTime - periodTime);
			break;
		default:
			timer.setTimer(0);
			break;
	}

	setScore(score, runState.score);

	runState.cycles.forEach((cycle) => {
		displayChange(changesElement, cycle.type, cycle.time, cycle.score);
	});

	setupStopwatch(cycleTimer, runState.cycleTime);
};

const resetRun = () => {
	setScore(score, 0);
	clearChanges(changesElement);
	resetStopwatch(cycleTimer);
	hideSavePrompt();
};

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
socket.onclose = () => {
	timer.stopTimer();
	stopStopwatch();
};

const handleMessage = (data: Message) => {
	console.debug(data);
	switch (data.event) {
		case "setState":
			if (data.name) {
				console.log("Received run state, updating info");
				let runState: RunState;
				try {
					runState = JSON.parse(data.name) as RunState;
				} catch {
					console.error(
						`Invalid state JSON received. Got "${data.name}"`
					);
					break;
				}
				setState(runState);
			}
			break;
		case "startAuto":
			running = true;
			setAutoTimer();
			sounds.playSound("autobegin");
			resetRun();
			break;
		case "startTransition":
			running = true;
			setTransitionTimer();
			sounds.playSound("autoend");
			resetRun();
			break;
		case "startTeleop":
			if (!running) {
				running = true;
				setTeleopTimer();
				sounds.playSound("teleopbegin");
				resetRun();
			}
			if (data.name && data.value) {
				data.value /= 1000;
				const expectedTime =
					data.name == "AUTO"
						? timerValues["auto"] + timerValues["transition"]
						: data.name == "TRANSITION"
						? timerValues["transition"]
						: 0;
				const difference = data.value - expectedTime;
				const positive = difference > 0;
				displayInfoColor(
					changesElement,
					"TeleOp started: " +
						(positive ? "+" : "-") +
						Math.abs(difference).toFixed(3),
					positive ? "var(--failure-color)" : "var(--success-color)"
				);
			} else {
				displayInfo(changesElement, "TeleOp started");
			}
			break;
		case "abort":
			running = false;
			sounds.playSound("abort");
			timer.stopTimer();
			stopStopwatch();
			break;
		case "resetCycle":
			resetStopwatch(cycleTimer);
			displayChange(changesElement, data.name, (data.value ?? 0) / 1000);
			break;
		case "setScore":
			if (Object.prototype.hasOwnProperty.call(data, "value")) {
				setScore(score, data.value!);
			}
			break;
		case "playSound":
			if (data.name) {
				sounds.playSound(data.name);
			}
			break;
		case "end":
			running = false;
			timer.stopTimer();
			stopStopwatch();
			if (data.name) {
				const runData = JSON.parse(data.name) as SaveRunData;

				const difference: number | null =
					runData.periodTimes[1] == null ||
					runData.periodTimes[2] == null
						? null
						: (runData.periodTimes[2] - runData.periodTimes[1]) /
								1e3 -
						  timerValues["teleop"];
				if (difference != null) {
					const positive = difference > 0;
					displayInfoColor(
						changesElement,
						"TeleOp ended: " +
							(difference > 0 ? "+" : "-") +
							Math.abs(difference).toFixed(3),
						positive
							? "var(--failure-color)"
							: "var(--success-color)"
					);
				} else {
					displayInfo(changesElement, "Run ended");
				}

				showSavePrompt(runData);
			} else {
				displayInfo(changesElement, "Run ended");
			}
			break;
		case "error":
			if (data.name) {
				console.error(`[SERVER] ${data.name}`);
			} else {
				console.error("[SERVER] An unknown error has occurred");
			}
			break;
		default:
			console.error("Unknown event received");
			break;
	}
};
