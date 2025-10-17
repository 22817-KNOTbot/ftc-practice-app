import { LayoutData } from "../types";

export function getLayoutData(): LayoutData {
	return {
		stylePath: "src/layouts/classic.css",
		timerHtml: `
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
`,
		statsHtml: `
<nav>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
</nav>
<div id="chart-div">
	<canvas id="chart"></canvas>
</div>
<div id="runModal" class="modal">
	<div id="modalHeaderContainer"><h1 id="modalHeader">Modal</h1></div>
	<div id="modalContent">
		Modal content
	</div>
</div>
<div id="loading-spinner"></div>
`,
	};
}
