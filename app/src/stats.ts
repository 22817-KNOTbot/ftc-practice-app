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
import { Cycle, Data, RunData } from "./types";
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
					if (document.querySelector(".shownModal.editModal")) return;
					showLoadingIndicator();
					getRunData(data[elements[0].index].filename)
						.then((runData) => {
							showRunData(
								runData,
								data[elements[0].index].filename
							);
						})
						.catch((reason) => {
							showRunError(
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
	modal.className = "modal shownModal";

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

	const editButton = content.appendChild(document.createElement("button"));
	editButton.id = "editRun";
	editButton.textContent = "Edit";
	editButton.classList.add("modalButton");
	editButton.addEventListener("click", () => {
		showRunEditModal(data, filename);
	});

	const downloadLink = content.appendChild(document.createElement("a"));
	const downloadButton = downloadLink.appendChild(
		document.createElement("button")
	);
	downloadLink.id = "downloadRun";
	downloadLink.href = `/practice/data/${filename}`;
	downloadLink.setAttribute("download", "");
	downloadButton.textContent = "Download";
	downloadButton.classList.add("modalButton");

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
	deleteButton.classList.add("modalButton");
	deleteButton.addEventListener("click", () => {
		fetch("/practice/data/delete", {
			headers: {
				filename: filename,
			},
			method: "POST",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`${response.status} ${response.statusText}`
					);
				}
				modal.classList.remove("shownModal");
				// Some browsers can't load the page right after deleting
				// the file for an unknown reason. Hard coded delay fixes it
				new Promise((resolve) => {
					setTimeout(resolve, 200);
				}).then(() => document.location.reload());
			})
			.catch((err: Error) => {
				showRunError(filename, err.message);
			});
	});
}

function showRunError(filename: string, reason?: string) {
	const modal = document.getElementById("runModal")!;
	const titleContainer = document.getElementById("modalHeaderContainer")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.className = "modal shownModal";

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

function showRunEditModal(data: RunData, filename?: string) {
	filename ??= data.timestamp + ".json";
	const modal = document.getElementById("runModal")!;
	const title = document.getElementById("modalHeader")!;
	const content = document.getElementById("modalContent")!;
	modal.className = "modal shownModal editModal";

	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = "";
	const titleInput = title.appendChild(document.createElement("input"));
	titleInput.classList.add("editModalInput", "editModalTitle");
	titleInput.value = data.name;
	titleInput.placeholder = data.name;

	titleInput.addEventListener("focusout", () => {
		const value = titleInput.value;
		if (value.trim().length == 0 && value.length > 0) {
			titleInput.classList.add("invalid");
		} else {
			titleInput.classList.remove("invalid");
		}
	});

	let infoHeader: HTMLElement = content.appendChild(
		document.createElement("h2")
	);
	infoHeader.className = "firstModalHeader";
	infoHeader = infoHeader.appendChild(document.createElement("u"));
	infoHeader.textContent = "Info";

	const subtitleDiv = content.appendChild(document.createElement("div"));
	const subtitle = subtitleDiv.appendChild(document.createElement("h3"));
	const subtitleInput = subtitleDiv.appendChild(
		document.createElement("input")
	);
	subtitle.className = "modalContentSubtitle editModalSubtitle";
	subtitleInput.type = "datetime-local";
	subtitleInput.id = "editModalDate";
	subtitleInput.classList.add("editModalInput");
	const rawDate: Date = new Date(data.timestamp * 1000);
	// Date inputs don't use time zones. Manually adjusting for time zones before passing it as input
	const date: Date = new Date(
		rawDate.getTime() - rawDate.getTimezoneOffset() * 60 * 1000
	);
	subtitle.textContent = "Date: ";
	subtitleInput.valueAsDate = date;
	subtitleInput.placeholder = rawDate.toString();
	subtitleInput.addEventListener("focusout", () => {
		const date = subtitleInput.valueAsDate;
		if (date == null) {
			subtitleInput.classList.add("invalid");
		} else {
			subtitleInput.classList.remove("invalid");
		}
	});

	const cycleHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	cycleHeader.textContent = "Cycles";

	const cycleTable = content.appendChild(document.createElement("table"));
	cycleTable.id = "cycleTable";
	cycleTable.className = "editCycleTable";
	const tableHeaderRow = cycleTable.appendChild(document.createElement("tr"));
	let header = tableHeaderRow.appendChild(document.createElement("th"));
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Time (s)";
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Type";
	header = tableHeaderRow.appendChild(document.createElement("th"));
	header.textContent = "Score";

	const timeInputs: HTMLInputElement[] = [];
	const typeInputs: HTMLInputElement[] = [];
	const scoreInputs: HTMLInputElement[] = [];

	let rowIndex = 0;
	const addRow = (cycle?: Cycle) => {
		const row = cycleTable.appendChild(document.createElement("tr"));
		let tableData = row.appendChild(document.createElement("td"));
		const deleteButton = tableData.appendChild(
			document.createElement("button")
		);
		deleteButton.classList.add("editModalDeleteButton");

		tableData = row.appendChild(document.createElement("td"));
		const timeInput = tableData.appendChild(
			document.createElement("input")
		);
		timeInput.classList.add("editModalInput", "editModalTableInput");
		timeInputs.push(timeInput);
		timeInput.value = cycle?.time.toString() ?? "";
		timeInput.placeholder = cycle?.time.toString() ?? "";

		tableData = row.appendChild(document.createElement("td"));
		const typeInput = tableData.appendChild(
			document.createElement("input")
		);
		typeInput.classList.add("editModalInput", "editModalTableInput");
		typeInputs.push(typeInput);
		typeInput.value = cycle?.type ?? "";
		typeInput.placeholder = cycle?.type ?? "";

		tableData = row.appendChild(document.createElement("td"));
		const scoreInput = tableData.appendChild(
			document.createElement("input")
		);
		scoreInput.classList.add("editModalInput", "editModalTableInput");
		scoreInputs.push(scoreInput);
		scoreInput.value = cycle?.score.toString() ?? "";
		scoreInput.placeholder = cycle?.score.toString() ?? "";

		// Event listeners
		const localRowIndex = rowIndex;
		deleteButton.addEventListener("click", () => {
			cycleTable.removeChild(row);
			timeInputs.splice(localRowIndex, 1);
			typeInputs.splice(localRowIndex, 1);
			scoreInputs.splice(localRowIndex, 1);
		});

		timeInput.addEventListener("focusout", () => {
			const parsedValue = Number(timeInput.value);
			if (
				(isNaN(parsedValue) ||
					!isFinite(parsedValue) ||
					parsedValue <= 0) &&
				timeInput.value.length > 0
			) {
				timeInput.classList.add("invalid");
			} else {
				timeInput.classList.remove("invalid");
			}
		});

		typeInput.addEventListener("focusout", () => {
			const value = typeInput.value;
			if (value.trim().length == 0 && value.length > 0) {
				typeInput.classList.add("invalid");
			} else {
				typeInput.classList.remove("invalid");
			}
		});

		scoreInput.addEventListener("focusout", () => {
			const parsedValue = Number(scoreInput.value);
			if (
				(isNaN(parsedValue) ||
					!isFinite(parsedValue) ||
					!Number.isInteger(parsedValue)) &&
				scoreInput.value.length > 0
			) {
				scoreInput.classList.add("invalid");
			} else {
				scoreInput.classList.remove("invalid");
			}
		});

		rowIndex++;
	};

	for (const cycle of data.cycles) {
		addRow(cycle);
	}

	const row = cycleTable.appendChild(document.createElement("tr"));
	const tableData = row.appendChild(document.createElement("td"));
	const addButton = tableData.appendChild(document.createElement("button"));
	addButton.classList.add("editModalAddButton");
	addButton.addEventListener("click", () => {
		cycleTable.removeChild(row);
		addRow();
		cycleTable.appendChild(row);
	});

	// TeleOp Times
	const teleopTimesHeader = content
		.appendChild(document.createElement("h2"))
		.appendChild(document.createElement("u"));
	teleopTimesHeader.textContent = "TeleOp Times";

	const teleopTimesStart = content.appendChild(document.createElement("div"));
	teleopTimesStart.classList.add("editModalTeleopLine");
	teleopTimesStart.textContent = "TeleOp start: ";
	const teleopTimesStartInput = teleopTimesStart.appendChild(
		document.createElement("input")
	);
	teleopTimesStartInput.classList.add("editModalInput");

	data.teleopTimes ??= [];
	const teleopStartTime = data.teleopTimes[0]
		? (data.teleopTimes[0] / 1e3).toString()
		: "";
	teleopTimesStartInput.value = teleopStartTime;
	teleopTimesStartInput.placeholder = teleopStartTime;

	teleopTimesStartInput.addEventListener("focusout", () => {
		const parsedValue = Number(teleopTimesStartInput.value);
		if (
			(isNaN(parsedValue) || !isFinite(parsedValue)) &&
			teleopTimesStartInput.value.trim().length > 0
		) {
			teleopTimesStartInput.classList.add("invalid");
		} else {
			teleopTimesStartInput.classList.remove("invalid");
		}
	});

	const teleopTimesEnd = content.appendChild(document.createElement("div"));
	teleopTimesEnd.classList.add("editModalTeleopLine");
	teleopTimesEnd.textContent = "TeleOp end: ";
	const teleopTimesEndInput = teleopTimesEnd.appendChild(
		document.createElement("input")
	);
	teleopTimesEndInput.classList.add("editModalInput");

	const teleopEndTime = data.teleopTimes[1]
		? (data.teleopTimes[1] / 1e3).toString()
		: "";
	teleopTimesEndInput.value = teleopEndTime;
	teleopTimesEndInput.placeholder = teleopEndTime;

	teleopTimesEndInput.addEventListener("focusout", () => {
		const parsedValue = Number(teleopTimesEndInput.value);
		if (
			(isNaN(parsedValue) || !isFinite(parsedValue)) &&
			teleopTimesEndInput.value.trim().length > 0
		) {
			teleopTimesEndInput.classList.add("invalid");
		} else {
			teleopTimesEndInput.classList.remove("invalid");
		}
	});

	// Buttons
	const saveButton = content.appendChild(document.createElement("button"));
	saveButton.id = "saveEdit";
	saveButton.textContent = "Save Edits";
	saveButton.classList.add("modalButton");
	saveButton.addEventListener("click", () => {
		let titleValue = titleInput.value;
		if (titleValue.trim().length == 0 && titleValue.length > 0) {
			titleValue = titleInput.placeholder;
		}

		let date = subtitleInput.valueAsDate;
		if (date == null) {
			date = new Date(subtitleInput.placeholder);
		} else {
			date = new Date(
				date.getTime() + rawDate.getTimezoneOffset() * 60 * 1000
			);
		}

		let score = 0;
		const info: RunData["info"] = {};
		const cycles: Cycle[] = [];
		for (let i = 0; i < timeInputs.length; i++) {
			const timeInput = timeInputs[i];
			const typeInput = typeInputs[i];
			const scoreInput = scoreInputs[i];

			let timeValue = Number(timeInput.value);
			let typeValue = typeInput.value;
			let scoreValue = Number(scoreInput.value);

			if (isNaN(timeValue) || !isFinite(timeValue) || timeValue <= 0) {
				timeValue = Number(timeInput.placeholder);
			}
			if (typeValue.trim().length == 0) {
				typeValue = typeInput.placeholder;
			}
			if (
				isNaN(scoreValue) ||
				!isFinite(scoreValue) ||
				!Number.isInteger(scoreValue)
			) {
				scoreValue = Number(scoreInput.placeholder);
			}

			score += scoreValue;
			info[typeValue] = (info[typeValue] ?? 0) + 1;

			cycles.push({
				time: timeValue,
				type: typeValue,
				score: scoreValue,
			});
		}

		let teleopTimes: RunData["teleopTimes"] = [];
		let teleopTimesStartValue = Number(teleopTimesStartInput.value);
		let teleopTimesEndValue = Number(teleopTimesEndInput.value);
		if (isNaN(teleopTimesStartValue) || !isFinite(teleopTimesStartValue)) {
			teleopTimesStartValue = Number(teleopTimesStartInput.placeholder);
		}
		if (isNaN(teleopTimesEndValue) || !isFinite(teleopTimesEndValue)) {
			teleopTimesEndValue = Number(teleopTimesEndInput.placeholder);
		}
		if (teleopTimesEndInput.value.trim().length != 0) {
			teleopTimes = [
				isNaN(teleopTimesStartValue) ? 0 : teleopTimesStartValue,
				teleopTimesEndValue,
			];
		} else if (teleopTimesStartInput.value.trim().length != 0) {
			teleopTimes = [teleopTimesStartValue];
		}

		const editedRunData = {
			name: titleValue,
			timestamp: Math.floor(date.getTime() / 1000),
			score: score,
			info: info,
			cycles: cycles,
			teleopTimes: teleopTimes,
		};

		fetch("/practice/data/edit", {
			headers: {
				filename: filename,
				runData: JSON.stringify(editedRunData),
			},
			method: "POST",
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error(
						`${response.status} ${response.statusText}`
					);
				}
				modal.classList.remove("shownModal");
				// Some browsers can't load the page right after deleting
				// the file for an unknown reason. Hard coded delay fixes it
				new Promise((resolve) => {
					setTimeout(resolve, 200);
				}).then(() => document.location.reload());
			})
			.catch((err: Error) => {
				showRunError(filename, err.message);
			});
	});

	const discardButton = content.appendChild(document.createElement("button"));
	discardButton.id = "discardEdit";
	discardButton.textContent = "Discard Edits";
	discardButton.classList.add("modalButton");
	discardButton.addEventListener("click", () => {
		modal.classList.remove("shownModal");
	});
}

window.addEventListener("mousedown", (event) => {
	const modal = document.getElementById("runModal")!;
	if (modal.classList.contains("editModal")) return;
	if (!modal.contains(event.target as HTMLElement)) {
		modal.classList.remove("shownModal");
	}
});

document.addEventListener("DOMContentLoaded", () => {
	const spinner = document.getElementById("loading-spinner");
	if (spinner) prepareSpinner(spinner);
});
