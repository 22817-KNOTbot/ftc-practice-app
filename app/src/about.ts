import { getLayout } from "./layouts";

const chosenLayout = localStorage.getItem("layout") ?? "Classic";
const layout = getLayout(chosenLayout);
const layoutData = layout.layoutDataGetter();
document.querySelector<HTMLDivElement>("#app")!.innerHTML =
	`<link rel="stylesheet" href="${layoutData.stylePath}">` +
	layoutData.html.about;
