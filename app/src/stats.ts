import {
	Chart,
	LineController,
	LineElement,
	PointElement,
	TimeSeriesScale,
	LinearScale,
	Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { getData, getRunData } from "./stats/data";
import "./style.css";
import { Data, RunData } from "./types";
import { updateTextSize } from "auto-text-size";
import {
	hideLoadingIndicator,
	prepareSpinner,
	showLoadingIndicator,
} from "./loading";
import { getLayout } from "./layouts";
import { registerNavbar } from "./navbar";
import { getSetting } from "./settingsManager";

let data: Data["data"];

const showChart = () => {
	getData().then((d) => {
		data = d.data;
		generateChart(document.getElementById("chart")! as HTMLCanvasElement);
	});
};

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
	styleTags + layoutData.html.stats;

registerNavbar(document.querySelector("nav")!);
showChart();

Chart.register(
	LineController,
	LineElement,
	PointElement,
	TimeSeriesScale,
	LinearScale,
	Tooltip
);

const textColor = window
	.getComputedStyle(document.body)
	.getPropertyValue("--text-color");

const fontFamily = window
	.getComputedStyle(document.body)
	.getPropertyValue("font-family");

Chart.defaults.color = textColor;
Chart.defaults.font.family = fontFamily;

const generateChart = async (chartCanvas: HTMLCanvasElement) => {
	const chartData: { name: string; time: number; score: number }[] = [];
	data.sort((a, b) => {
		return a.timestamp - b.timestamp;
	});
	data.forEach((e) => {
		chartData.push({
			name: e.name,
			time: e.timestamp * 1000,
			score: e.score,
		});
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
						beforeBody: (context) => {
							let text = "";
							if (context[0] != null) {
								const timestamp =
									data[context[0].dataIndex].timestamp * 1000;
								const date: Date = new Date(timestamp);
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
					titleFont: {
						size: 15,
					},
					bodyFont: {
						size: 13,
					},
					animations: {
						x: {
							duration: 0,
						},
						y: {
							duration: 0,
						},
						width: {
							duration: 0,
						},
						height: {
							duration: 0,
						},
					},
				},
			},
			elements: {
				point: {
					radius: 5,
					backgroundColor: "#fff",
					borderColor: "#4bbfff",
					borderWidth: 2,
					hitRadius: 5,
				},
				line: {
					borderColor: "#5feddd",
				},
			},
			scales: {
				x: {
					type: "timeseries",
					time: {
						minUnit: "day",
					},
					ticks: {
						font: {
							size: 13,
						},
					},
					title: {
						display: true,
						align: "center",
						text: "Time",
						font: {
							size: 15,
						},
					},
					grid: {
						color: (context) => {
							if (context.index == 0) {
								return textColor;
							}
							return "";
						},
					},
				},
				y: {
					beginAtZero: true,
					ticks: {
						precision: 0,
						font: {
							size: 13,
						},
					},
					title: {
						display: true,
						align: "center",
						text: "Points",
						font: {
							size: 15,
						},
					},
					grid: {
						color: (context) => {
							if (context.index == 0) {
								return textColor;
							}
							return "#444";
						},
					},
				},
			},
			maintainAspectRatio: false,
			onClick: (_e, elements) => {
				if (elements.length > 0) {
					showLoadingIndicator();
					getRunData(data[elements[0].index].filename)
						.then((runData) => {
							showRunData(
								runData,
								data[elements[0].index].filename
							);
						})
						.catch((reason) => {
							showRunNotFound(
								data[elements[0].index].filename,
								reason
							);
						})
						.finally(() => {
							hideLoadingIndicator();
						});
				}
			},
			onHover: (event, elements) => {
				if (event?.native?.target) {
					(event.native.target as HTMLElement).style.cursor =
						elements[0] ? "pointer" : "default";
				}
			},
		},
	});
};

function showRunData(data: RunData, filename?: string) {
	filename ??= data.timestamp + ".json";
	const modal = document.getElementById("runModal")!;
	const titleContainer = document.getElementById("modalHeaderContainer")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.classList.add("shownModal");

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = `${data.name}`;
	updateTextSize({
		innerEl: title,
		containerEl: titleContainer,
		mode: "box",
	});

	let infoHeader: HTMLElement = content.appendChild(
		document.createElement("h2")
	);
	infoHeader.className = "firstModalHeader";
	infoHeader = infoHeader.appendChild(document.createElement("u"));
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
	const downloadLink = content.appendChild(document.createElement("a"));
	const downloadButton = downloadLink.appendChild(
		document.createElement("button")
	);
	downloadLink.id = "downloadRun";
	downloadLink.href = `/practice/data/${filename}`;
	downloadLink.setAttribute("download", "");
	downloadButton.textContent = "Download";

	downloadLink.addEventListener("click", (e) => {
		if (e.target) {
			// No good way of detecting when downloaded, only option
			// is to say downloading
			(e.target as HTMLElement).textContent = "Downloading";
		}
	});

	const deleteButton = content.appendChild(document.createElement("button"));
	deleteButton.id = "deleteRun";
	deleteButton.textContent = "Delete";
	deleteButton.addEventListener("click", () => {
		fetch("/practice/data/delete", {
			headers: {
				filename: filename,
			},
			method: "POST",
		})
			.then(() => {
				modal.classList.remove("shownModal");
				// Some browsers can't load the page right after deleting
				// the file for an unknown reason. Hard coded delay fixes it
				new Promise((resolve) => {
					setTimeout(resolve, 200);
				}).then(() => document.location.reload());
			})
			.catch((err: Error) => {
				showRunNotFound(filename, err.message);
			});
	});
}

function showRunNotFound(filename: string, reason?: string) {
	const modal = document.getElementById("runModal")!;
	const titleContainer = document.getElementById("modalHeaderContainer")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.classList.add("shownModal");

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = "Error fetching run data";
	updateTextSize({
		innerEl: title,
		containerEl: titleContainer,
		mode: "box",
	});

	const message = content.appendChild(document.createElement("div"));
	const is404Error = reason?.startsWith("404") ?? false;
	if (is404Error) {
		message.textContent = `Run not found with file name "${filename}":`;
	} else {
		message.textContent = `Error getting run data for file name "${filename}":`;
	}

	const errorMessage = content.appendChild(document.createElement("samp"));
	errorMessage.textContent = reason?.toString() ?? "No reason provided";

	const solutionsHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	solutionsHeader.textContent = "Possible solutions";

	content.appendChild(document.createElement("ul"));
	let solutions: string[] = [];
	if (is404Error) {
		solutions = [
			"If the run file was moved elsewhere, restore the file",
			"If the run file was meant to be deleted, restart the robot",
			"If the deletion was unintentional, report this as a bug",
		];
	} else {
		solutions = [
			"If it is a network error, ensure you are connected to the robot wifi",
			"Try restarting the robot",
			"If the issue persists, report this as a bug",
		];
	}
	solutions.forEach((text) => {
		const solution = content.appendChild(document.createElement("li"));
		solution.textContent = text;
	});
}

window.addEventListener("click", (event) => {
	const modal = document.getElementById("runModal")!;
	if (!modal.contains(event.target as HTMLElement)) {
		modal.classList.remove("shownModal");
	}
});

document.addEventListener("DOMContentLoaded", () => {
	const spinner = document.getElementById("loading-spinner");
	if (spinner) prepareSpinner(spinner);
});
