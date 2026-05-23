const { WebSocketServer } = require("ws");
const blessed = require("blessed");

const wss = new WebSocketServer({ port: 8888 });

// Change this to test different states
const state = {
	running: true,
	matchPeriod: "AUTO",
	periodTime: 25,
	score: 30,
	cycles: [
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "leave",
			score: 1,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
		{
			time: 2,
			type: "Artifact",
			score: 3,
		},
	],
	cycleTime: 12,
};

const screen = blessed.screen({
	smartCSR: true,
});
const box = blessed.log({
	height: "100%-2",
	width: "100%",
	top: 0,
	left: 0,
	mouse: true,
	keys: true,
	alwaysScroll: true,
	scrollable: true,
});

const labels = blessed.textbox({
	left: 0,
	bottom: 1,
	width: "100%",
	height: 1,
	style: {
		bg: "blue",
		text: "white",
	},
});

const input = blessed.textbox({
	inputOnFocus: true,
	left: 0,
	bottom: 0,
	width: "100%",
	height: 1,
	// keys: true,
	// mouse: true,
	style: {
		bg: "gray",
	},
});
screen.append(box);
screen.append(labels);
screen.append(input);
input.focus();
screen.key(["escape", "C-c"], (ch, key) => process.exit(0));
input.key(["escape", "C-c"], (ch, key) => process.exit(0));

input.key("up", (ch, key) => {
	box.scroll(-1);
	screen.render();
});

input.key("down", () => {
	box.scroll(1);
	screen.render();
});

const print = (text) => {
	box.log(text);
	screen.render();
};

let sendFunction = (msg) => {};

input.on("submit", (text) => {
	input.clearValue();
	input.focus();
	screen.render();

	if (text == "cls") {
		box.setContent("");
		screen.render();
		return;
	}

	const parts = text.split(" ");
	if (parts.length < 3) return;

	const msg = JSON.stringify({
		event: "addCycle",
		name: JSON.stringify({
			type: parts[1],
			time: parseInt(parts[0]),
			score: parseInt(parts[2]),
		}),
	});
	sendFunction(msg);
	print(`Sent: ${msg}`);
});

wss.on("connection", (socket) => {
	print("Client connected");
	sendFunction = (msg) => socket.send(msg);

	socket.on("message", (data) => {
		print(`Received: ${data}`);

		let json = "";
		try {
			json = JSON.parse(data);
		} catch (e) {
			box.error(`Invalid JSON received: ${data}`);
			return;
		}
		let response = undefined;
		switch (json.event) {
			case "getState":
				response = {
					event: "setState",
					name: JSON.stringify(state),
				};
				print("Sending state");
				break;
			case "editRun":
				const newState = state;
				const cycles = JSON.parse(json.name).cycles;
				newState.cycles = cycles;
				let score = 0;
				for (const cycle of cycles) {
					score += cycle.score;
				}
				newState.score = score;
				wss.clients.forEach((client) => {
					client.send(
						JSON.stringify({
							event: "setState",
							name: JSON.stringify(newState),
						}),
					);
				});
				print("Sending state after edit");
		}
		if (response) socket.send(JSON.stringify(response));
	});

	socket.on("close", () => {
		print("Client disconnected");
		sendFunction = (msg) => {};
	});
});

print("WebSocket server is running on ws://localhost:8888");
labels.setContent("Time | Type | Score");
