(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&o(r)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const g={layout:"Modern",timerValues:{auto:30,transition:8,teleop:120,endgame:20},mode:"view"},h="settings";function v(t){const e=localStorage.getItem(h)??"{}";let a=null;if(e)try{a=JSON.parse(e)}catch{console.error("Invalid stored settings! Resetting settings"),localStorage.clear()}return(a??g)[t]??g[t]}function L(t){localStorage.setItem(h,JSON.stringify(t))}const m=v("mode"),n=`
<nav>
${m=="view"?`
			<a href="/practice">Timer</a>
		`:m=="edit"?`
				<a href="/practice/edit">Edit</a>
			`:""}	<a href="/practice/stats">Stats</a>
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;function f(){return{stylePath:"/practice/assets/layouts/classic.css",html:{timer:`
${n}
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
`,stats:`
${n}
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
`,settings:`
${n}
<div id="settings-container">
	<div id="settings-normal-container" class="settings-section-container">
		<div class="settings-section">
			<h1>Layout</h1>
			<div id="settings-layouts-container">
				${y().map(t=>`<div class="settings-layout" data-layout="${t.name}">
							<div class="settings-layout-image"><img src="${t.imagePath}"></div>
							<div class="settings-layout-name">${t.name}</div>
						</div>
						`).reduce((t,e)=>t+e)}
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
`,about:`
${n}
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
`,edit:`
${n}
<div id="edit-container">
	<div id="edit-scores-container">
		<table id="edit-scores-table">
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
</div>
`}}}const c="/practice/assets/favicon.ico",p=v("mode"),d=`
<nav class="collapsed">
${p=="view"?`
			<a href="/practice" class="navbar-img"><img src="${c}"></a>
			<a href="/practice">Timer</a>
		`:p=="edit"?`
				<a href="/practice/edit" class="navbar-img"><img src="${c}"></a>
				<a href="/practice/edit">Edit</a>
			`:""}
	<a href="/practice/stats">Stats</a>
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;function b(){return{stylePath:"/practice/assets/layouts/modern.css",html:{timer:`
${d}
<div id="timer-container">
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
`,stats:`
${d}
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
<div id="loading-spinner-container">
	<div id="loading-spinner"></div>
</div>
`,settings:`
${d}
<div id="settings-container">
	<div id="settings-content">
		<div id="settings-normal-container" class="settings-section-container">
			<div class="settings-section">
				<h1>Layout</h1>
				<div id="settings-layouts-container">
					${y().map(t=>`<div class="settings-layout" data-layout="${t.name}">
								<div class="settings-layout-image"><img src="${t.imagePath}"></div>
								<div class="settings-layout-name">${t.name}</div>
							</div>
							`).reduce((t,e)=>t+e)}
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
</div>
<div id="confirmationModal" class="modal">
	<div id="modalHeaderContainer"><h1 id="modalHeader">Modal</h1></div>
	<div id="modalContent">
		Modal content
	</div>
</div>
`,about:`
${d}
<div id="about-container">
	<div id="about-content">
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
</div>
`,edit:`
${d}
<div id="edit-container">
	<div id="edit-scores-container">
		<table id="edit-scores-table">
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
</div>
`}}}const u=v("mode"),S=`
<nav class="collapsed">
${u=="view"?`
	<a href="/practice" class="navbar-img"><img src="${c}"></a>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
	`:u=="edit"?`
	<a href="/practice/edit" class="navbar-img"><img src="${c}"></a>
	<a href="/practice/edit">Edit</a>
	`:""}
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;function T(){const t=b();return{stylePath:["/practice/assets/layouts/modern.css","/practice/assets/layouts/chromaKey.css"],html:{timer:`
${S}
<div id="timer-container">
	<div id="timer-section">
		<div id="chroma-screen"></div>
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
`,stats:t.html.stats,settings:t.html.settings,about:t.html.about,edit:t.html.edit}}}const l=[{name:"Modern",imagePath:"/practice/assets/layouts/modern.jpg",layoutDataGetter:b},{name:"Chroma Key",imagePath:"/practice/assets/layouts/chromaKey.jpg",layoutDataGetter:T},{name:"Classic",imagePath:"/practice/assets/layouts/classic.jpg",layoutDataGetter:f}];function $(t){for(const e of l)if(e.name==t)return e;return l[0]}function y(){return l}function w(t){const e=()=>{let a=0;for(const o of t.children)a+=o.offsetHeight;t.style.setProperty("--total-height",`${a}px`),t.classList.remove("collapsed")};t.addEventListener("mouseenter",e),t.addEventListener("resize",e),t.addEventListener("mouseleave",()=>{t.classList.add("collapsed")})}export{$ as a,v as g,w as r,L as s};
