let spinner: HTMLElement;
export function prepareSpinner(element: HTMLElement) {
	spinner = element;
	element.innerHTML = `
		<svg class="loading-container" viewBox="0 0 40 40">
			<circle class="loading-track" cx="20" cy="20" r="17.5" pathlength="100" stroke-width="5px" fill="none" />
			<circle class="loading-car" cx="20" cy="20" r="17.5" pathlength="100" stroke-width="5px" fill="none" />
		</svg>
	`;
}

export function showLoadingIndicator() {
	spinner?.classList.add("shownSpinner");
}

export function hideLoadingIndicator() {
	spinner?.classList.remove("shownSpinner");
}
