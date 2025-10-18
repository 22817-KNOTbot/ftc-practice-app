export function registerNavbar(navbar: HTMLElement) {
	navbar.addEventListener("mouseenter", () => {
		navbar.classList.remove("collapsed");
	});

	navbar.addEventListener("mouseleave", () => {
		navbar.classList.add("collapsed");
	});
}
