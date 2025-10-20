export function registerNavbar(navbar: HTMLElement) {
	navbar.addEventListener("mouseenter", () => {
		let heightSum = 0;
		for (const child of navbar.children) {
			heightSum += (child as HTMLElement).offsetHeight;
		}
		navbar.style.setProperty("--total-height", `${heightSum}px`);
		navbar.classList.remove("collapsed");
	});

	navbar.addEventListener("mouseleave", () => {
		navbar.classList.add("collapsed");
	});
}
