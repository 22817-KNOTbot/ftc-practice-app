import { getLayout } from "./layouts";
import { registerNavbar } from "./navbar";
import { getSetting, saveSettings } from "./settingsManager";
import { getData } from "./stats/data";
import { Settings } from "./types";

const DEFAULT_TIMER_TIMES: { [key: string]: number } = {
	auto: 30,
	transition: 8,
	teleop: 120,
	endgame: 20,
};

let runCount = 0;
getData().then((d) => {
	runCount = Object.keys(d.data).length;
});

const chosenLayout = getSetting("layout");
const storedTimerValues = getSetting("timerValues");
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
	styleTags + layoutData.html.settings;

registerNavbar(document.querySelector("nav")!);

const layoutSettingsOptions = document.querySelectorAll(".settings-layout");

const updateSelectedLayout = (selectedLayout: string) => {
	const currentlySelected =
		document.querySelectorAll<HTMLDivElement>(".selected");
	for (const option of currentlySelected) {
		option.classList.remove("selected");
	}

	const newlySelected = document.querySelector<HTMLDivElement>(
		`.settings-layout[data-layout="${selectedLayout}"`
	);
	newlySelected?.classList.add("selected");
};

updateSelectedLayout(chosenLayout);

const currentSettings: Settings = {
	layout: chosenLayout,
	timerValues: storedTimerValues,
};

for (const option of layoutSettingsOptions) {
	option.addEventListener("click", (e) => {
		const targetElement = e.target as HTMLElement;
		const newLayout =
			targetElement?.dataset?.layout ??
			targetElement?.parentElement?.dataset.layout ??
			targetElement?.parentElement?.parentElement?.dataset.layout;
		if (newLayout) {
			currentSettings.layout = newLayout;
			updateSelectedLayout(newLayout);
		}
	});
}

const timerSettingsInputs = document.querySelectorAll<HTMLInputElement>(
	".settings-timer-value>input"
);

for (const input of timerSettingsInputs) {
	const period = input.dataset["timerPeriod"];
	if (period) {
		input.value =
			currentSettings.timerValues[period]?.toString() ??
			DEFAULT_TIMER_TIMES[period] ??
			0;
	}
	input.addEventListener("focusout", (e) => {
		const targetElement = e.target as HTMLInputElement;
		const valueNumber = targetElement.valueAsNumber;
		if (
			isNaN(valueNumber) ||
			valueNumber < 0 ||
			!Number.isInteger(valueNumber)
		) {
			targetElement.classList.add("invalid");
		} else {
			targetElement.classList.remove("invalid");
		}
	});
}

const saveChanges = (settings: Settings) => {
	const newTimerValues: { [key: string]: number } = {};
	for (const input of timerSettingsInputs) {
		const period = input.dataset["timerPeriod"];
		const valueNumber = input.valueAsNumber;
		if (
			!isNaN(valueNumber) &&
			valueNumber >= 0 &&
			Number.isInteger(valueNumber) &&
			period
		) {
			newTimerValues[period] = valueNumber;
		}
	}
	settings.timerValues = newTimerValues;

	saveSettings(currentSettings);
	document.location.reload();
};

const submitButtonList = document.querySelectorAll<HTMLElement>(
	"#settings-save-button"
);
for (const submitButton of submitButtonList) {
	submitButton.addEventListener("click", () => saveChanges(currentSettings));
}

// Danger zone options
const resetButton = document.getElementById("settings-reset-button");

resetButton?.addEventListener("click", () => {
	showResetConfirmationModal();
});

const showResetConfirmationModal = () => {
	const modal = document.getElementById("confirmationModal");
	const titleContainer = document.getElementById("modalHeaderContainer");
	const title = document.getElementById("modalHeader");
	const content = document.getElementById("modalContent");
	if (!modal || !titleContainer || !title || !content) return;

	modal.classList.add("shownModal");
	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = "Reset all settings";

	const infoHeader: HTMLElement = content.appendChild(
		document.createElement("h2")
	);
	infoHeader.className = "firstModalHeader";
	infoHeader.textContent = "Are you sure you want to reset all settings?";

	const subtitle = content.appendChild(document.createElement("h3"));
	subtitle.className = "modalContentSubtitle";
	subtitle.textContent = "You cannot undo this action!";

	const confirmButton = content.appendChild(document.createElement("button"));
	confirmButton.id = "confirmDanger";
	confirmButton.textContent = "Confirm";

	confirmButton.addEventListener("click", () => {
		localStorage.clear();
		document.location.reload();
	});
};

const deleteRunsButton = document.getElementById("settings-delete-button");

deleteRunsButton?.addEventListener("click", () => {
	showDeleteRunsConfirmationModal();
});

const showDeleteRunsConfirmationModal = () => {
	const modal = document.getElementById("confirmationModal");
	const titleContainer = document.getElementById("modalHeaderContainer");
	const title = document.getElementById("modalHeader");
	const content = document.getElementById("modalContent");
	if (!modal || !titleContainer || !title || !content) return;

	modal.classList.add("shownModal");
	content.scrollTop = 0;
	content.innerHTML = "";

	title.textContent = "Delete all runs";

	const infoHeader: HTMLElement = content.appendChild(
		document.createElement("h2")
	);
	infoHeader.className = "firstModalHeader";
	infoHeader.textContent = "Are you sure you want to delete all runs?";

	const subtitle = content.appendChild(document.createElement("h3"));
	subtitle.className = "modalContentSubtitle";
	subtitle.textContent =
		"This will clear all your run data and stats. You cannot undo this action!";

	const challengeText = `Yes, I want to delete all ${runCount} runs`;
	const challenge = content.appendChild(document.createElement("p"));
	challenge.className = "modalConfirmationChallenge";
	challenge.textContent = `To confirm, type "${challengeText}"`;

	const form = content.appendChild(document.createElement("form"));
	form.autocomplete = "off";

	const input = form.appendChild(document.createElement("input"));
	input.id = "challengeInput";
	input.classList.add("editModalInput");
	input.setAttribute("type", "text");
	input.setAttribute("placeholder", challengeText);

	const confirmButton = form.appendChild(document.createElement("input"));
	confirmButton.type = "submit";
	confirmButton.id = "confirmDanger";
	confirmButton.textContent = "Confirm";

	form.addEventListener("submit", (event) => {
		event.preventDefault();
		if (input.value == challengeText) {
			fetch("/practice/data/delete", {
				headers: {
					"challenge-answer": runCount.toString(),
				},
				method: "POST",
			}).then((response) => {
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
			});
		} else {
			input.classList.add("invalid");
		}
	});
};

window.addEventListener("mousedown", (event) => {
	const modal = document.getElementById("confirmationModal")!;
	if (!modal.contains(event.target as HTMLElement)) {
		modal.classList.remove("shownModal");
	}
});
