(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&n(c)}).observe(document,{childList:!0,subtree:!0});function a(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(i){if(i.ep)return;i.ep=!0;const s=a(i);fetch(i.href,s)}})();const o="/practice/assets/favicon.ico";var h=(t=>(t.MIN="Min",t.MAX="Max",t.MEAN="Mean",t.MEDIAN="Median",t.SECS_PER_POINT="Secs/Point",t.POINTS_PER_SEC="Points/Sec",t.STD_DEV="Std Dev",t.HIGH_25="Best 25%",t.LOW_25="Worst 25%",t.HIGH_10="Best 10%",t.LOW_10="Worst 10%",t))(h||{});const l=Object.freeze({layout:"Modern",timerValues:{auto:30,transition:8,teleop:120,endgame:20},mode:"view",manualScoringPresets:[],cycleStats:["Min","Max","Mean","Secs/Point","Points/Sec"]}),r="settings";function m(t){const e=localStorage.getItem(r)??"{}";let a=null;if(e)try{a=JSON.parse(e)}catch{console.error("Invalid stored settings! Resetting settings"),localStorage.clear()}return(a??l)[t]??l[t]}function S(t){localStorage.setItem(r,JSON.stringify(t))}function M(t,e){const a=localStorage.getItem(r)??"{}";let n=null;if(a)try{n=JSON.parse(a)}catch{console.error("Invalid stored settings! Resetting settings"),localStorage.clear()}n??(n=l),n[t]=e,localStorage.setItem(r,JSON.stringify(n))}const g=m("mode"),d=`
<nav class="collapsed">
${g=="view"?`
			<a href="/practice" class="navbar-img"><img src="${o}"></a>
			<a href="/practice">Timer</a>
		`:g=="edit"?`
				<a href="/practice/edit" class="navbar-img"><img src="${o}"></a>
				<a href="/practice/edit">Edit</a>
			`:""}
	<a href="/practice/stats">Stats</a>
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;function p(){return{stylePath:"/practice/assets/layouts/modern.css",html:{timer:`
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
		<div class="settings-section-container">
			<div id="settings-mode-container">
				<h1>Mode</h1>
				<select id="settings-mode-dropdown" class="settings-dropdown">
					<option value="view">View</option>
					<option value="edit">Edit</option>
				</select>
			</div>
			<div id="settings-stats-container">
				<h1>Cycle Stats</h1>
				<select id="settings-stats-input" multiple></select>
			</div>
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
`}}}const u=m("mode"),b=`
<nav class="collapsed">
${u=="view"?`
	<a href="/practice" class="navbar-img"><img src="${o}"></a>
	<a href="/practice">Timer</a>
	<a href="/practice/stats">Stats</a>
	`:u=="edit"?`
	<a href="/practice/edit" class="navbar-img"><img src="${o}"></a>
	<a href="/practice/edit">Edit</a>
	`:""}
	<a href="/practice/settings">Settings</a>
	<a href="/practice/about">About</a>
</nav>
`;function f(){const t=p();return{stylePath:["/practice/assets/layouts/modern.css","/practice/assets/layouts/chromaKey.css"],html:{timer:`
${b}
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
`,stats:t.html.stats,settings:t.html.settings,about:t.html.about,edit:t.html.edit}}}const v=[{name:"Modern",imagePath:"/practice/assets/layouts/modern.jpg",layoutDataGetter:p},{name:"Chroma Key",imagePath:"/practice/assets/layouts/chromaKey.jpg",layoutDataGetter:f}];function T(t){for(const e of v)if(e.name==t)return e;return v[0]}function y(){return v}function L(t){const e=()=>{let a=0;for(const n of t.children)a+=n.offsetHeight;t.style.setProperty("--total-height",`${a}px`),t.classList.remove("collapsed")};t.addEventListener("mouseenter",e),t.addEventListener("resize",e),t.addEventListener("mouseleave",()=>{t.classList.add("collapsed")})}export{h as C,l as D,T as a,m as g,L as r,S as s,M as u};
