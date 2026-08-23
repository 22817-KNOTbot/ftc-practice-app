import { getLayoutData as getModernLayoutData } from "./layouts/modern";
import { getLayoutData as getOverlayLayoutData } from "./layouts/overlay";
import { Layout } from "./types";

const layouts: Layout[] = [
	{
		name: "Modern",
		imagePath: "/practice/assets/layouts/modern.jpg",
		layoutDataGetter: getModernLayoutData,
	},
	{
		name: "Overlay",
		imagePath: "/practice/assets/layouts/overlay.jpg",
		layoutDataGetter: getOverlayLayoutData,
	},
];

export function getLayout(name: string) {
	for (const layout of layouts) {
		if (layout.name == name) {
			return layout;
		}
	}
	return layouts[0];
}

export function getLayouts() {
	return layouts;
}
