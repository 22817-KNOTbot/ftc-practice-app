import { setScore } from "./score.ts";
import { Sounds } from "./sfx.ts";
import { createSocket } from "./socket.ts";
import "./style.css";
import { resetStopwatch, stopStopwatch, setTimer, stopTimer } from "./timer.ts";
import { Message } from "./types.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<div id="timer-section">
	<div id="timer">2:30</div>
	<input type="text" id="input">
	<input type="submit" id="send">
</div>
<div id="bottom-section">
	<div id="changes-box">1</div>
	<div id="score-box">
		<div id="score">0</div>
	</div>
	<div id="cycle-time-box">
		<div id="cycle-timer">0.00</div>
	</div>
</div>
`;

const sounds: Sounds = new Sounds();
sounds.preload();

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
	if (time == 120) {
		sounds.playSound("autoend");
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

const socket = createSocket();
socket.onmessage = (event) => {
	let jsonData: Message;
	try {
		jsonData = JSON.parse(event.data) as Message;
	} catch {
		console.error("Invalid socket message received");
		return;
	}
	handleMessage(jsonData);
};

const handleMessage = (data: Message) => {
	switch (data.event) {
		case "start":
			sounds.playSound("autobegin");
			setTimer(timer, 150, timerLoop);
			resetStopwatch(cycleTimer);
			break;
		case "end":
			break;
		case "abort":
			sounds.playSound("abort");
			stopTimer();
			stopStopwatch();
			break;
		case "resetTimer":
			setTimer(timer, 150, timerLoop);
			break;
		case "resetCycle":
			resetStopwatch(cycleTimer);
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
		default:
			console.error("Unknown event received");
			break;
	}
};

// TESTING CODE
document.getElementById("send")!.addEventListener("click", () => {
	socket.send((document.getElementById("input") as HTMLInputElement)!.value);
});
