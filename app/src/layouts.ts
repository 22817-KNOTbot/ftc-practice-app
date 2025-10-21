import { getLayoutData as getClassicLayoutData } from "./layouts/classic";
import { getLayoutData as getModernLayoutData } from "./layouts/modern";
import { getLayoutData as getGreenScreenLayoutData } from "./layouts/greenScreen";
import { Layout } from "./types";

const layouts: Layout[] = [
	{
		name: "Modern",
		imagePath: "/practice/assets/layouts/modern.jpg",
		layoutDataGetter: getModernLayoutData,
	},
	{
		name: "Green Screen",
		imagePath: "/practice/assets/layouts/greenScreen.jpg",
		layoutDataGetter: getGreenScreenLayoutData,
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
