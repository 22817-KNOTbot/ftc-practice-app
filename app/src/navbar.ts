export function registerNavbar(navbar: HTMLElement) {
	const updateSize = () => {
		let heightSum = 0;
		for (const child of navbar.children) {
			heightSum += (child as HTMLElement).offsetHeight;
		}
		navbar.style.setProperty("--total-height", `${heightSum}px`);
		navbar.classList.remove("collapsed");
	};

	navbar.addEventListener("mouseenter", updateSize);
	navbar.addEventListener("resize", updateSize);

	navbar.addEventListener("mouseleave", () => {
		navbar.classList.add("collapsed");
	});
}
