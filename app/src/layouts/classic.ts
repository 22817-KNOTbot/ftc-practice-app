import { getLayouts } from "../layouts";
import { getSetting } from "../settingsManager";
import { LayoutData } from "../types";

const mode = getSetting("mode");

const nav = `
<nav>
${
	mode == "view"
		? `
			<a href="/practice">Timer</a>
		`
		: mode == "edit"
			? `
				<a href="/practice/edit">Edit</a>
			`
			: ""
}	<a href="/practice/stats">Stats</a>
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;

export function getLayoutData(): LayoutData {
	return {
		stylePath: "/practice/assets/layouts/classic.css",
		html: {
			timer: `
${nav}
<div>
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
</div>
<div id="saveModal" class="modal">
	<h1 id="modalHeader">Modal</h1>
	<div id="modalContent">
		Modal content
	</div>
</div>
`,
			stats: `
${nav}
<div id="chart-div">
	<div id="chart-options-container">
		<select id="chart-type-dropdown">
			<option value="score">Score</option>
			<option value="meanCycleTime">Mean cycle time</option>
			<option value="pointsPerSecond">Points/second</option>
		</select>
	</div>
	<div id="chart-container">
		<canvas id="chart"></canvas>
	</div>
</div>
<div id="runModal" class="modal">
	<div id="modalHeaderContainer"><h1 id="modalHeader">Modal</h1></div>
	<div id="modalContent">
		Modal content
	</div>
</div>
<div id="loading-spinner"></div>
`,
			settings: `
${nav}
<div id="settings-container">
	<div id="settings-normal-container" class="settings-section-container">
		<div class="settings-section">
			<h1>Layout</h1>
			<div id="settings-layouts-container">
				${getLayouts()
					.map((layout) => {
						return `<div class="settings-layout" data-layout="${layout.name}">
							<div class="settings-layout-image"><img src="${layout.imagePath}"></div>
							<div class="settings-layout-name">${layout.name}</div>
						</div>
						`;
					})
					.reduce((a, b) => a + b)}
			</div>
		</div>
	</div>
	<div id="settings-save-container" class="settings-section-container">
		<div class="settings-section settings-save-section">
			<input id="settings-save-button" class="settings-button" type="submit" value="Save Changes">
		</div>
	</div>
	<div id="settings-timer-container" class="settings-section-container">
		<h1>Timer Settings</h1>
		<div class="settings-timer-line">
			<label for="settings-timer-auto">Auto Length</label>
			<span class="settings-timer-value"><input type="number" id="settings-timer-auto" data-timer-period="auto">s</span>
		</div>
		<div class="settings-timer-line">
			<label for="settings-timer-transition">Transition Length</label>
			<span class="settings-timer-value"><input type="number" id="settings-timer-transition" data-timer-period="transition">s</span>
		</div>
		<div class="settings-timer-line">
			<label for="settings-timer-teleop">TeleOp Length</label>
			<span class="settings-timer-value"><input type="number" id="settings-timer-teleop" data-timer-period="teleop">s</span>
		</div>
		<div class="settings-timer-line">
			<label for="settings-timer-endgame">Endgame Length</label>
			<span class="settings-timer-value"><input type="number" id="settings-timer-endgame" data-timer-period="endgame">s</span>
		</div>
	</div>
	<div id="settings-mode-container" class="settings-section-container">
		<h1>Mode</h1>
		<select id="settings-mode-dropdown">
			<option value="view">View</option>
			<option value="edit">Edit</option>
		</select>
	</div>
	<div id="settings-danger-container" class="settings-section-container">
		<div class="settings-section settings-danger-section">
			<h1>Danger Zone</h1>
			<input id="settings-reset-button" class="settings-button" type="button" value="Reset all settings">
			<input id="settings-delete-button" class="settings-button" type="button" value="Delete all runs">
		</div>
	</div>
</div>
<div id="confirmationModal" class="modal">
	<div id="modalHeaderContainer"><h1 id="modalHeader">Modal</h1></div>
	<div id="modalContent">
		Modal content
	</div>
</div>
`,
			about: `
${nav}
<div id="about-container">
	<h1 id="about-header">About</h1>
	<p class="text-center">
		FTC Practice App by 22817 KNOTbot is a web app created to improve your driving performance in practice of the
		FIRST<sup>®</sup> Tech Challenge’s yearly competitions
	</p>
	<p class="text-center">Please read the <a href="https://github.com/22817-KNOTbot/ftc-practice-app" target="_blank">GitHub page</a> for instructions</p>
	<p>Key features</p>
	<ul>
		<li>Easy to use interface</li>
		<li>Automatically keep track of points</li>
		<li>Record cycle times with millisecond precision</li>
		<li>View past run data to track progress</li>
	</ul>
	<p>Extra features</p>
	<ul>
		<li>Label runs with custom identifiable names</li>
		<li>View advanced statistics including mean cycle time and scoring rate</li>
		<li>Play real FTC match sounds</li>
		<li>Show a warning when starting early or ending matches late</li>
		<li>Synchronize with multiple devices</li>
	</ul>
	<p class="text-center">FTC Practice App is open source and licensed under the <a
			href="https://github.com/22817-KNOTbot/ftc-practice-app/blob/main/LICENSE" target="_blank">MIT License</a>.
	</p>
</div>
`,
			edit: `
${nav}
<div id="edit-container">
	<div id="edit-scores-container" class="edit-page-container">
		<h1>Edit Current Run</h1>
		<table id="edit-scores-table" class="edit-page-table">
			<thead>
				<tr>
					<th></th>
					<th>Time (s)</th>
					<th>Type</th>
					<th>Score</th>
				</tr>
			</thead>
		<tbody id="edit-table-body"></tbody>
		</table>
		<button id="edit-table-save-button" class="edit-table-button">Save</button>
	</div>
	<div id="manual-scoring-container" class="edit-page-container">
		<h1>Manual Scoring</h1>
		<table id="manual-scoring-table" class="edit-page-table">
			<thead>
				<tr>
					<th></th>
					<th>Time (s)</th>
					<th>Type</th>
					<th>Score</th>
					<th>Send</th>
				</tr>
			</thead>
			<tbody id="manual-scoring-table-body"></tbody>
		</table>
	</div>
</div>
`,
		},
	};
}
