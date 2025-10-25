import { getLayoutData as getClassicLayoutData } from "./layouts/classic";
import { getLayoutData as getModernLayoutData } from "./layouts/modern";
import { getLayoutData as getChromaKeyScreenLayoutData } from "./layouts/chromaKey";
import { Layout } from "./types";

const layouts: Layout[] = [
	{
		name: "Modern",
		imagePath: "/practice/assets/layouts/modern.jpg",
		layoutDataGetter: getModernLayoutData,
	},
	{
		name: "Chroma Key",
		imagePath: "/practice/assets/layouts/chromaKey.jpg",
		layoutDataGetter: getChromaKeyScreenLayoutData,
	},
	{
		name: "Classic",
		imagePath: "/practice/assets/layouts/classic.jpg",
		layoutDataGetter: getClassicLayoutData,
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
