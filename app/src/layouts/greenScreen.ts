import { LayoutData } from "../types";
import { getLayoutData as getModernLayoutData } from "./modern";
import faviconUrl from "../assets/images/favicon.ico";

const nav = `
<nav class="collapsed">
	<a href="/practice" class="navbar-img"><img src="${faviconUrl}"></a>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;

export function getLayoutData(): LayoutData {
	const modernLayoutData = getModernLayoutData();

	return {
		stylePath: [
			"/practice/assets/layouts/modern.css",
			"/practice/assets/layouts/greenScreen.css",
		],
		html: {
			timer: `
${nav}
<div id="timer-container">
	<div id="timer-section">
		<div id="green-screen"></div>
	</div>
	<div id="bottom-section">
		<div id="timer-box">
			<div id="timer">2:30</div>
		</div>
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
			stats: modernLayoutData.html.stats,
			settings: modernLayoutData.html.settings,
			about: modernLayoutData.html.about,
		},
	};
}
