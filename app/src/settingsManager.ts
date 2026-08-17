import { Cycle } from "./types";

export type Settings = {
	layout: string;
	timerValues: {
		[key: string]: number;
	};
	mode: "view" | "edit";
	manualScoringPresets: Cycle[];
	cycleStats: CycleStat[];
};

export enum CycleStat {
	MIN = "Min",
	MAX = "Max",
	MEAN = "Mean",
	MEDIAN = "Median",
	SECS_PER_POINT = "Secs/Point",
	POINTS_PER_SEC = "Points/Sec",
	STD_DEV = "Std Dev",
	HIGH_25 = "Best 25%",
	LOW_25 = "Worst 25%",
	HIGH_10 = "Best 10%",
	LOW_10 = "Worst 10%",
}

export const DEFAULT_SETTINGS: Settings = Object.freeze({
	layout: "Modern",
	timerValues: {
		auto: 30,
		transition: 8,
		teleop: 120,
		endgame: 20,
	},
	mode: "view",
	manualScoringPresets: [],
	cycleStats: [
		CycleStat.MIN,
		CycleStat.MAX,
		CycleStat.MEAN,
		CycleStat.SECS_PER_POINT,
		CycleStat.POINTS_PER_SEC,
	],
});
const SETTINGS_STORAGE_KEY = "settings";

export function getSetting<settingKey extends keyof Settings>(
	setting: settingKey,
): Settings[settingKey] {
	const currentSettings = localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}";
	let parsedCurrentSettings: Settings | null = null;
	if (currentSettings) {
		try {
			parsedCurrentSettings = JSON.parse(currentSettings);
		} catch {
			console.error("Invalid stored settings! Resetting settings");
			localStorage.clear();
		}
	}

	return (
		(parsedCurrentSettings ?? DEFAULT_SETTINGS)[setting] ??
		DEFAULT_SETTINGS[setting]
	);
}

export function saveSettings(settings: Settings) {
	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function updateSetting<settingKey extends keyof Settings>(
	setting: settingKey,
	value: Settings[settingKey],
) {
	const currentSettings = localStorage.getItem(SETTINGS_STORAGE_KEY) ?? "{}";
	let parsedSettings: Settings | null = null;
	if (currentSettings) {
		try {
			parsedSettings = JSON.parse(currentSettings);
		} catch {
			console.error("Invalid stored settings! Resetting settings");
			localStorage.clear();
		}
	}

	parsedSettings ??= DEFAULT_SETTINGS;
	parsedSettings[setting] = value;

	localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsedSettings));
}
