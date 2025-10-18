import { getLayoutData as getClassicLayoutData } from "./layouts/classic";
// import { getLayoutData as getModernLayoutData } from "./layouts/modern";
import { Layout } from "./types";

const layouts: Layout[] = [
	{
		name: "Modern",
		imagePath: "src/assets/images/layouts/modern.webp",
		layoutDataGetter: getClassicLayoutData,
	},
	{
		name: "Green Screen",
		imagePath: "src/assets/images/layouts/modern.webp",
		layoutDataGetter: getClassicLayoutData,
	},
	{
		name: "Classic",
		imagePath: "src/assets/images/layouts/classic.webp",
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
