import ReconnectingWebSocket from "reconnecting-websocket";
import { clearChanges, displayChange, setScore } from "./score.ts";
import { Sounds } from "./sfx.ts";
import { createSocket } from "./socket.ts";
import "./style.css";
import {
	resetStopwatch,
	stopStopwatch,
	setTimer,
	stopTimer,
	setupStopwatch,
} from "./timer.ts";
import { Message, RunState } from "./types.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
</nav>
<div id="timer-section">
	<div id="timer">2:30</div>
</div>
<div id="bottom-section">
	<div id="changes-box">
		<div class="change change-0"><div></div></div>
		<div class="change change-1"><div></div></div>
		<div class="change change-2"><div></div></div>
		<div class="change change-3"><div></div></div>
	</div>
	<div id="score-box">
		<div id="score">
			0
		</div>
	</div>
	<div id="cycle-time-box">
		<div id="cycle-timer">0.00</div>
	</div>
</div>
<div id="saveModal" class="modal">
	<h1 id="modalHeader">Modal</h1>
	<div id="modalContent">
		Modal content
	</div>
</div>
`;

const sounds: Sounds = new Sounds();
sounds.preload();

// TODO: change timer system to store extra value instead of relying on time
// to allow for directly starting in teleop, etc.
const timer = document.getElementById("timer")!;
const timerLoop = (time: number) => {
	switch (time) {
		case 120:
			sounds.playSound("autoend");
			setTimer(timer, 8, transitionTimerLoop);
			break;
		case 30:
			sounds.playSound("endgame");
			break;
		case 0:
			sounds.playSound("endmatch");
			break;
	}
};
const transitionTimerLoop = (time: number) => {
	switch (time) {
		case 6:
			sounds.playSound("pickupcontrollers");
			break;
		case 3:
			sounds.playSound("countdown");
			break;
		case 0:
			sounds.playSound("teleopbegin");
			setTimer(timer, 120, timerLoop);
	}
};

const cycleTimer = document.getElementById("cycle-timer")!;

const score = document.getElementById("score")!;
const changesElement = document.getElementById("changes-box")!;

const showSavePrompt = () => {
	const modal = document.getElementById("saveModal")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.classList.add("shownModal");

	title.textContent = "Save run";

	content.innerHTML = "";

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

	submit.addEventListener("click", (event) => {
		event.preventDefault();
		saveRun(input.value);
		hideSavePrompt();
	});
};

const hideSavePrompt = () => {
	const modal = document.getElementById("saveModal");
	if (modal != null) modal.classList.remove("shownModal");
};

const saveRun = (name: string) => {
	if (socket.readyState == WebSocket.OPEN) {
		const timestamp = Math.floor(Date.now() / 1000);
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
	if (!runState.running) return;

	// Set timer depending on stage of game
	// (Will be changed after timer rework)
	const time = runState.runTime;
	if (time < 30) {
		setTimer(timer, 150 - time, timerLoop);
	} else if (time < 38) {
		setTimer(timer, 38 - time, transitionTimerLoop);
	} else if (time < 158) {
		setTimer(timer, 158 - time, timerLoop);
	} else {
		setTimer(timer, 0);
	}

	setScore(score, runState.score);

	runState.cycles.forEach((cycle) => {
		displayChange(changesElement, cycle.type, cycle.time, cycle.score);
	});

	const lastCycle = runState.cycles[runState.cycles.length - 1];
	const lastCycleTime = lastCycle?.time ?? 0;
	setupStopwatch(cycleTimer, time - lastCycleTime);
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
	stopTimer();
	stopStopwatch();
};

const handleMessage = (data: Message) => {
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
		case "start":
			sounds.playSound("autobegin");
			setTimer(timer, 150, timerLoop);
			setScore(score, 0);
			clearChanges(changesElement);
			resetStopwatch(cycleTimer);
			hideSavePrompt();
			break;
		case "abort":
			sounds.playSound("abort");
			stopTimer();
			stopStopwatch();
			break;
		case "resetCycle":
			resetStopwatch(cycleTimer);
			displayChange(changesElement, data.name, (data.value ?? 0) / 1000);
			break;
		case "setScore":
			if (data.value) {
				setScore(score, data.value);
			}
			break;
		case "playSound":
			if (data.name) {
				sounds.playSound(data.name);
			}
			break;
		case "end":
			stopTimer();
			stopStopwatch();
			showSavePrompt();
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
