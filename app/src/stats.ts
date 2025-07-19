import Chart from "chart.js/auto";
import { getData, getRunData } from "./stats/data";
import "./style.css";
import { Data, RunData } from "./types";

let data: Data["data"];

getData().then((d) => {
	data = d.data;
	generateChart(document.getElementById("chart")! as HTMLCanvasElement);
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<nav>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
</nav>
<div id="chart-div">
	<canvas id="chart"></canvas>
</div>
<div id="runModal">
	<h1 id="modalHeader">Modal</h1>
	<div id="modalContent">
		Modal content
	</div>
</div>
`;

const generateChart = async (chartCanvas: HTMLCanvasElement) => {
	const chartData: { name: string; time: number; score: number }[] = [];
	data.sort((a, b) => {
		return a.time - b.time;
	});
	data.forEach((e) => {
		chartData.push({ name: e.name, time: e.time, score: e.score });
	});

	new Chart(chartCanvas, {
		type: "line",
		data: {
			labels: chartData.map((e) => e.time),
			datasets: [
				{
					label: "Score",
					data: chartData.map((e) => e.score),
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: false,
				},
				tooltip: {
					displayColors: false,
					callbacks: {
						title: (context) => {
							let text = "";
							if (context[0] != null) {
								text = data[context[0].dataIndex].name;
							}

							return text;
						},
						afterTitle: (context) => {
							let text = "";
							if (context[0] != null) {
								const timestamp = context[0].label;
								const date: Date = new Date(
									parseInt(timestamp) * 1000
								);
								text = date.toLocaleString(undefined, {
									month: "short",
									day: "numeric",
									year: "numeric",
									hour: "numeric",
									minute: "2-digit",
								});
							}

							return text;
						},
					},
				},
			},
			onClick: (_e, elements) => {
				if (elements.length > 0) {
					showRunData(getRunData(data[elements[0].index].filename));
				}
			},
			onHover: (event, elements) => {
				if (event?.native?.target) {
					(event.native.target as HTMLElement).style.cursor =
						elements[0] ? "pointer" : "default";
				}
			},
			elements: {
				point: {
					radius: 5,
					backgroundColor: "#FFF",
					borderColor: "#4bbfff",
					borderWidth: 2,
					hitRadius: 5,
				},
				line: {
					borderColor: "#5feddd",
				},
			},
			scales: {
				y: {
					beginAtZero: true,
				},
			},
		},
	});
};

function showRunData(data: RunData) {
	console.log(data);
	const modal = document.getElementById("runModal")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.classList.add("shownModal");

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = `${data.name}`;

	const infoHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	infoHeader.textContent = "Info";

	const subtitle = content.appendChild(document.createElement("h3"));
	subtitle.className = "modalContentSubtitle";
	const date: Date = new Date(data.timestamp * 1000);
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

	const cycleHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	cycleHeader.textContent = "Cycles";

	const cycleTable = content.appendChild(document.createElement("table"));
	cycleTable.id = "cycleTable";
	const tableHeaderRow = cycleTable.appendChild(document.createElement("tr"));
	let header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Time";
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Type";

	for (const cycle in data.cycles) {
		const row = cycleTable.appendChild(document.createElement("tr"));
		let tableData = row.appendChild(document.createElement("td"));
		tableData.textContent = data.cycles[cycle].time.toString();
		tableData = row.appendChild(document.createElement("td"));
		tableData.textContent = data.cycles[cycle].type;
	}
}

window.addEventListener("click", (event) => {
	const modal = document.getElementById("runModal")!;
	if (!modal.contains(event.target as HTMLElement)) {
		modal.classList.remove("shownModal");
	}
});
