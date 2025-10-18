import { getLayout } from "./layouts";
import { registerNavbar } from "./navbar";

const chosenLayout = localStorage.getItem("layout") ?? "Classic";
const layout = getLayout(chosenLayout);
const layoutData = layout.layoutDataGetter();
let styleTags = "";
if (typeof layoutData.stylePath == "object") {
	layoutData.stylePath.forEach((path) => {
		styleTags += `<link rel="stylesheet" href="${path}">`;
	});
} else {
	styleTags = `<link rel="stylesheet" href="${layoutData.stylePath}">`;
}
document.querySelector<HTMLDivElement>("#app")!.innerHTML =
	styleTags + layoutData.html.about;

registerNavbar(document.querySelector("nav")!);
