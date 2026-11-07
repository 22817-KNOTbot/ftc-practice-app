import ReconnectingWebSocket from "reconnecting-websocket";
import {
	addScore,
	clearChanges,
	displayChange,
	displayInfo,
	displayInfoColor,
	setScore,
	updateChangesTextSize,
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
import { Cycle, Message, RunData, RunState, SaveRunData } from "./types.ts";
import { getLayout } from "./layouts.ts";
import { registerNavbar } from "./navbar.ts";
import { getSetting } from "./settingsManager.ts";
import { showSaveModal } from "./runData/modals.ts";

let running = false;

let chosenLayout = getSetting("layout");
if ((window as unknown as { obsstudio: unknown }).obsstudio) {
	chosenLayout = "Overlay";
}
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
	timerValues["auto"] + timerValues["teleop"],
);

const cycleTimer = document.getElementById("cycle-timer")!;

const score = document.getElementById("score")!;
const changesElement = document.getElementById("changes-box")!;
window.addEventListener("resize", updateChangesTextSize);

const showSavePrompt = (data: SaveRunData) => {
	const modal = document.getElementById("saveModal")!;

	showSaveModal(modal, data, saveRun);
};

const hideSavePrompt = () => {
	const modal = document.getElementById("saveModal");
	if (modal != null) modal.classList.remove("shownModal");
};

const saveRun = (runData: RunData) => {
	if (runData.name == "") return;
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
						`Invalid state JSON received. Got "${data.name}"`,
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
					positive ? "var(--failure-color)" : "var(--success-color)",
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
		case "addCycle": {
			resetStopwatch(cycleTimer);
			if (!data.name) break;
			const cycle = JSON.parse(data.name) as Cycle;
			displayChange(
				changesElement,
				cycle.type,
				cycle.time ?? 0,
				cycle.score,
			);
			addScore(score, cycle.score);
			break;
		}
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
							: "var(--success-color)",
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
