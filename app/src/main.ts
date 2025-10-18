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
} from "./timer.ts";
import { Message, RunData, RunState } from "./types.ts";
import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";

let running = false;

const chosenLayout = localStorage.getItem("layout") ?? "Classic";
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

const timer = new Timer(document.getElementById("timer")!);

const cycleTimer = document.getElementById("cycle-timer")!;

const score = document.getElementById("score")!;
const changesElement = document.getElementById("changes-box")!;

const showSavePrompt = (data?: RunData) => {
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
		saveRun(input.value, Math.floor(date.getTime() / 1000));
		hideSavePrompt();
	});

	if (!data) return;

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

	if (
		data.teleopTimes != undefined &&
		data.teleopTimes.length > 0 &&
		(data.teleopTimes[0] != null || data.teleopTimes[1] != null)
	) {
		const teleopTimesHeader = content
			.appendChild(document.createElement("h2"))
			.appendChild(document.createElement("u"));
		teleopTimesHeader.textContent = "TeleOp Times";

		const teleopTimesStart = content.appendChild(
			document.createElement("div")
		);
		if (data.teleopTimes[0] != undefined) {
			teleopTimesStart.textContent =
				`TeleOp start: ${Math.abs(data.teleopTimes[0]) / 1e3}s ` +
				`${
					data.teleopTimes[0] == 0
						? ""
						: data.teleopTimes[0] > 0
						? "late"
						: "early"
				}`;
		}

		const teleopTimesEnd = content.appendChild(
			document.createElement("div")
		);
		if (data.teleopTimes[1] != undefined) {
			teleopTimesEnd.textContent =
				`TeleOp end: ${Math.abs(data.teleopTimes[1]) / 1e3}s ` +
				`${
					data.teleopTimes[1] == 0
						? ""
						: data.teleopTimes[1] > 0
						? "late"
						: "early"
				}`;
		}
	}
};

const hideSavePrompt = () => {
	const modal = document.getElementById("saveModal");
	if (modal != null) modal.classList.remove("shownModal");
};

const saveRun = (name: string, timestamp?: number) => {
	if (socket.readyState == WebSocket.OPEN) {
		timestamp ??= Math.floor(Date.now() / 1000);
		const data: Message = {
			event: "saveRun",
			name: name,
			value: timestamp,
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
	switch (period) {
		case "AUTO":
			setAutoTimer(150 - periodTime);
			break;
		case "TRANSITION":
			setTransitionTimer(8 - periodTime);
			break;
		case "TELEOP":
			setTeleopTimer(120 - periodTime);
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
			if (data.value) {
				data.value /= 1000;
				const positive = data.value > 0;
				displayInfoColor(
					changesElement,
					"TeleOp started: " +
						(positive ? "+" : "-") +
						Math.abs(data.value).toFixed(3),
					positive ? "var(--success-color)" : "var(--failure-color)"
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
			if (data.value) {
				data.value /= 1000;
				const positive = data.value > 0;
				displayInfoColor(
					changesElement,
					"TeleOp ended: " +
						(data.value > 0 ? "+" : "-") +
						Math.abs(data.value).toFixed(3),
					positive ? "var(--failure-color)" : "var(--success-color)"
				);
			} else {
				displayInfo(changesElement, "Run ended");
			}
			if (data.name) {
				const json = JSON.parse(data.name) as RunData;
				showSavePrompt(json);
			} else {
				showSavePrompt();
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
